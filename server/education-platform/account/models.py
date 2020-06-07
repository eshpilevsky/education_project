import os
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core import validators
from django.core.mail import EmailMultiAlternatives
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.template import Context
from django.template.loader import get_template
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from account.managers import CustomUserManager

import logging

logger = logging.getLogger(__name__)


EMAIL_VERIFICATION_PLAINTEXT = get_template("email_verification.txt")
EMAIL_VERIFICATION_HTMLY = get_template("email_verification.html")

PASSWORD_RESET_PLAINTEXT = get_template("password_reset.txt")
PASSWORD_RESET_HTMLY = get_template("password_reset.html")

TEACHER_VERIFICATION_PLAINTEXT = get_template("teacher_verification.txt")
TEACHER_VERIFICATION_HTMLY = get_template("teacher_verification.html")


class StudentData(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)

    class Meta:
        verbose_name = _("Student data")
        verbose_name_plural = verbose_name

    def __str__(self):
        return str(self.user)


def teacher_upload_path(instance, filename):
    return 'teacher-files/{0}/{1}'.format(instance.user.uuid, filename)


def profile_upload_path(instance, filename):
    return 'teacher-pics/{0}{1}'.format(instance.user.uuid, os.path.splitext(filename)[1])


class TeacherData(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)

    class Meta:
        verbose_name = _("Teacherdate")
        verbose_name_plural = verbose_name

    verified = models.BooleanField(_("Verified"), default=False)
    verification_file = models.FileField(verbose_name=_(
        "Defense file"), upload_to=teacher_upload_path, null=True, blank=True)

    profile_picture = models.ImageField(
        _("Profile pic"), upload_to=profile_upload_path, null=True)

    __was_verified = None

    def __init__(self, *args, **kwargs):
        super(TeacherData, self).__init__(*args, **kwargs)
        self.__was_verified = self.verified

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.__was_verified != self.verified:
            self.send_verified_email()

        return super(TeacherData, self).save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)

    def send_verified_email(self):
        subject, from_email, to = "Verification for education-platform.by", "noreply@education-platform.by", self.user.email
        d = {
            "user": self.user,
            "login_url": settings.HOST,
        }
        text_content = TEACHER_VERIFICATION_PLAINTEXT.render(d)
        html_content = TEACHER_VERIFICATION_HTMLY.render(d)
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

    def __str__(self):
        return str(self.user)

    def image_tag(self):
        return mark_safe('<img src="/media/%s" width="256" height="256" />' % (self.profile_picture))

    image_tag.short_description = 'Profilbild'


@receiver(pre_save, sender=TeacherData)
def delete_document_if_verified(sender, instance, **kwargs):
    if instance.verified and instance.verification_file:
        try:
            instance.verification_file.delete(save=False)
            instance.verification_file = None
        except Exception:
            logger.exception(
                "Exception occured while trying to delete verified file")


class VerificationToken(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created = models.DateTimeField(_("Created"), auto_now_add=True)

    class Meta:
        verbose_name = "E-Mail Verification token"
        verbose_name_plural = verbose_name


class PasswordResetToken(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created = models.DateTimeField(_("Created"), auto_now_add=True)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_("E-Mail"), max_length=254, unique=True)
    email_verified = models.BooleanField(_("E-Mail approved"), default=False)
    # UUID field for identification in e.g. BBB-Service (also possibly shadow-accounts for LIMITED!!! access)
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(
        verbose_name=_("Accession"), auto_now_add=True)

    state = models.CharField(_("State"), max_length=50, blank=True)
    first_name = models.CharField(_("First name"), max_length=50, blank=False)
    last_name = models.CharField(_("Last name"), max_length=50, blank=True)

    # gender-specific
    MALE = 'MA'
    FEMALE = 'FE'
    GENDER_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female')
    ]

    gender = models.CharField(
        _("Gender"), max_length=2, choices=GENDER_CHOICES)

    # Define Django properties
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'state']
    objects = CustomUserManager()

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    __email = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__email = self.email

    def send_verification_email(self):
        if not self.email_verified:
            token = VerificationToken.objects.get_or_create(user=self)[0]
            subject, from_email, to = "Email confirmation for education-platform.by", "noreply@education-platform.by", self.email
            d = {
                'user': self,
                'verification_url': settings.HOST + "/account/verify?token=" + str(token.token)
            }
            text_content = EMAIL_VERIFICATION_PLAINTEXT.render(d)
            html_content = EMAIL_VERIFICATION_HTMLY.render(d)
            msg = EmailMultiAlternatives(
                subject, text_content, from_email, [to])
            msg.attach_alternative(html_content, "text/html")
            msg.send()

    def check_email_verification(self, check_token):
        if str(self.verificationtoken.token) == str(check_token):
            self.email_verified = True
            self.verificationtoken.delete()
            self.save()
            return True
        else:
            return False

    def send_reset_mail(self):
        PasswordResetToken.objects.filter(user=self).delete()
        token = PasswordResetToken(user=self)
        token.save()
        subject, from_email, to = "Reset password on education-platform.by", "noreply@education-platform.by", self.email
        d = {
            'user': self,
            'reset_url': settings.HOST + "/account/password-reset/{}".format(token.token)
        }
        text_content = PASSWORD_RESET_PLAINTEXT.render(d)
        html_content = PASSWORD_RESET_HTMLY.render(d)
        msg = EmailMultiAlternatives(
            subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

    def is_teacher(self):
        return hasattr(self, 'teacherdata')

    def is_student(self):
        return hasattr(self, 'studentdata')

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.__email.lower() != self.email.lower():
            self.email_verified = False
            self.send_verification_email()

        return super(CustomUser, self).save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)

    is_teacher.boolean = True
    is_teacher.admin_order_field = 'teacherdata'
    is_student.boolean = True
    is_student.admin_order_field = 'studentdata'

    def __str__(self):
        return self.email


@receiver(post_save, sender=CustomUser)
def send_verify_on_creation(sender, instance, created, **kwargs):
    if created:
        instance.send_verification_email()
