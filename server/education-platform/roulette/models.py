import datetime
import hashlib
import random
import time
import uuid
import xml.etree.ElementTree as ET
from datetime import timedelta
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.db.models.signals import (post_delete, post_save, pre_delete,
                                      pre_save)
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from account.models import StudentData, Subject, TeacherData


class Report(models.Model):
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 to_field='uuid', related_name='provided_reports')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 to_field='uuid', related_name='received_reports')

    message = models.TextField(_("Message"))

    meeting = models.ForeignKey(
        'roulette.Meeting', on_delete=models.CASCADE, null=True)

    created = models.DateTimeField(
        verbose_name=_("Created"), auto_now_add=True, editable=False)

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Messages"


class Feedback(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid', related_name='provided_feedback')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 on_delete=models.CASCADE, to_field='uuid', related_name='received_feedback')

    message = models.TextField(_("Message"), blank=True)

    meeting = models.ForeignKey(
        'roulette.Meeting', on_delete=models.CASCADE, null=True)

    rating = models.PositiveSmallIntegerField(_("Rating"), validators=[
        MinValueValidator(0), MaxValueValidator(5)])
    created = models.DateTimeField(
        verbose_name=_("Created"), auto_now_add=True)

    class Meta:
        unique_together = [['receiver', 'provider', 'meeting']]


class Request(models.Model):
    """superclass for request of a Meeting, either on Student or on Teacher side

    A User can only have one active request at a time. Also adding a created field, that makes it possible to prune old requests
    We also keep track of a list of failed_matches that should make sure the same Match isn't tried more than once
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    # Setting related_name to '+' --> no reverse relation from User necessary (for now)
    failed_matches = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                            related_name='+', blank=True)

    created = models.DateTimeField(auto_now_add=True)

    is_manual_deleted = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    deactivated = models.DateTimeField(null=True)

    last_poll = models.DateTimeField(default=timezone.now)

    meeting = models.OneToOneField(
        "roulette.Meeting", on_delete=models.SET_NULL, null=True, default=None, related_name='+')
    

    def _successful(self):
        if self.meeting:
            return self.meeting.duration >= timedelta(minutes=5)
        return False
    _successful.boolean = True
    successful = property(_successful)

    @property
    def duration(self):
        if self.deactivated is not None:
            return self.deactivated - self.created
        else:
            return timezone.now() - self.created

    def manual_delete(self):
        self.is_manual_deleted = True
        self.save()
        self.delete()

    def deactivate(self):
        if self.is_active:
            self.is_active = False
            self.deactivated = timezone.now()
            if isinstance(self, TeacherRequest):
                Match.objects.filter(teacher_request__id=self.id).delete()
            if isinstance(self, StudentRequest):
                Match.objects.filter(student_request__id=self.id).delete()
            self.save()

    class Meta:
        abstract = True


class StudentRequest(Request):
    """student request always additionally includes a Subject representing the subject he/she needs help with"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)


class TeacherRequest(Request):
    """teacherrequest can store additional data"""
    pass


@receiver(post_save, sender=TeacherRequest)
@receiver(post_save, sender=StudentRequest)
def look_for_match(sender, instance, **kwargs):
    if instance.is_active and not hasattr(instance, 'match'):
        if sender is StudentRequest:
            # look for open teacher requests and match the best one
            teacher_requests = TeacherRequest.objects.exclude(
                user__in=instance.failed_matches.all())

            teacher_requests = teacher_requests.exclude(is_active=False).exclude(
                user__teacherdata__verified=False).filter(match__isnull=True)
            # filter teacher requests for matching subject
            filtered = []
            for r in teacher_requests.all():
                if r.user.teacherdata.subjects.filter(pk=instance.subject.id).exists() \
                   and not (r.failed_matches.filter(pk=instance.user.id).exists()):
                   # and r.user.teacherdata.schooldata.filter(id=instance.user.studentdata.school_data.id).exists(): TODO: Reinsert after enough teachers
                    filtered.append(r)
            if filtered:
                best_teacher = max(
                    filtered, key=lambda k: calculate_matching_score(instance, k))
                Match.objects.create(
                    student_request=instance,
                    teacher_request=best_teacher
                )
        elif sender is TeacherRequest:
            student_requests = StudentRequest.objects.exclude(is_active=False).exclude(
                user__in=instance.failed_matches.all())
            student_requests = student_requests.filter(match__isnull=True)

            subjects = instance.user.teacherdata.subjects.all()
            schooldata = instance.user.teacherdata.schooldata.all()
            student_requests = student_requests.filter(subject__in=subjects)
            # .filter(
            #    user__studentdata__school_data__in=schooldata)
            filtered = []
            for r in student_requests.all():
                if not (r.failed_matches.filter(pk=instance.user.id).exists()):
                    filtered.append(r)

            if filtered:
                best_student = max(
                    filtered, key=lambda k: calculate_matching_score(k, instance))

                Match.objects.create(
                    student_request=best_student,
                    teacher_request=instance
                )


def calculate_matching_score(student_request: StudentRequest, teacher_request: TeacherRequest):
    score = 1
    student = student_request.user
    teacher = teacher_request.user
    if student.state == teacher.state:
        score += 5
    if student.gender == teacher.gender:
        score += 3
    if student.studentdata.school_data in teacher.teacherdata.schooldata.all():
        score += 10
    return score


class Match(models.Model):
    """Represents a Match between two requests StudentRequest, TeacherRequest

    If two matching requests StudentRequest <-> TeacherRequest are found, a Match is created. Both sides have to agree to complete the Match
    Only one Match can be assigned to a request at any time. (OneToOneField)
    If the match is not successfull, the corresponding user is added to both failed_matches lists
    We keep track of the created_time and the changed_time to be able to set upper reaction time-limits on matches
    """
    student_request = models.OneToOneField(
        StudentRequest, on_delete=models.CASCADE)
    teacher_request = models.OneToOneField(
        TeacherRequest, on_delete=models.CASCADE)

    student_agree = models.BooleanField(default=False)
    teacher_agree = models.BooleanField(default=False)

    created_time = models.DateTimeField(auto_now_add=True)
    changed_time = models.DateTimeField(auto_now=True)

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)


@receiver(pre_save, sender=Match)
def on_match_change(sender, instance, **kwargs):
    if instance.student_agree and instance.teacher_agree and not hasattr(instance, 'meeting'):
        meeting = Meeting(match=instance, name="education-platform - Meeting")
        # meeting.users.add(instance.student_request.user
        # )
        meeting.save()
        meeting.users.add(instance.student_request.user,
                          instance.teacher_request.user)
        meeting.teacher = instance.teacher_request.user
        meeting.student = instance.student_request.user
        # Add meeting to corresponding requests
        instance.teacher_request.meeting = meeting
        instance.student_request.meeting = meeting
        instance.teacher_request.save(update_fields=('meeting', ))
        instance.student_request.save(update_fields=('meeting', ))
        meeting.save()
        meeting.create_meeting()

        # send update with meeting to requests


@receiver(post_delete, sender=Match)
def on_match_delete(sender, instance: Match, **kwargs):
    if instance.student_agree and instance.teacher_agree:
        # TODO: do nothing? request feedback?
        pass
    else:
        # add to both requests failed matches and save --> should re-start matching
        teacher = instance.teacher_request.user
        student = instance.student_request.user
        if not instance.teacher_request.is_manual_deleted:
            instance.teacher_request.failed_matches.add(student)
            instance.teacher_request.save()
        if not instance.student_request.is_manual_deleted:
            instance.student_request.failed_matches.add(teacher)
            instance.student_request.save()


class Meeting(models.Model):
    """
    Meeting model represents a Meeting in BigBlueButton, using the available functions result in API calls
    """
    meeting_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    match = models.OneToOneField(Match, to_field='uuid',
                                 on_delete=models.SET_NULL, null=True)

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='teacher_meetings', to_field='uuid')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='student_meetings', to_field='uuid')

    name = models.CharField(_("Meeting-Name"), max_length=254)

    users = models.ManyToManyField(settings.AUTH_USER_MODEL)

    attendee_pw = models.CharField(max_length=120, null=True)
    moderator_pw = models.CharField(max_length=120, null=True)

    established = models.BooleanField(default=False)
    is_establishing = models.BooleanField(default=False)
    time_established = models.DateTimeField(
        _("Built up"), null=True, blank=True)

    ended = models.BooleanField(default=False)
    time_ended = models.DateTimeField(_("Completed"), null=True, blank=True)

    @property
    def duration(self):
        if self.time_established:
            if self.time_ended:
                return self.time_ended - self.time_established
            else:
                return timezone.now() - self.time_established
        else:
            return None

    def build_api_request(self, call, parameters):
        to_hash = call + urlencode(parameters) + settings.BBB_SHARED
        h = hashlib.sha1(to_hash.encode('utf-8'))
        parameters['checksum'] = h.hexdigest()
        url = "{}/bigbluebutton/api/".format(
            settings.BBB_URL)
        request = url + "{}?{}".format(call, urlencode(parameters))
        return request

    def create_meeting(self):
        if not self.is_establishing:
            self.is_establishing = True
            self.save()
            parameters = {'name': 'education-platform.by',
                          'meetingID': str(self.meeting_id),
                          'meta_endCallbackUrl': settings.API_HOST + "/roulette/meeting/end/"+str(self.meeting_id)+"/",
                          'logoutURL': settings.HOST,
                          'welcome': 'Welcome to education-platform.by!'}
            r = requests.get(self.build_api_request("create", parameters))
            root = ET.fromstring(r.content)
            if r.status_code == 200:
                self.attendee_pw = root.find("attendeePW").text
                self.moderator_pw = root.find("moderatorPW").text
                self.established = True
                self.is_establishing = False
                self.time_established = timezone.now()
    #        self._add_webhook()
            self.save()
        else:
            while self.is_establishing:
                time.sleep(0.05)
                self.refresh_from_db(fields=['is_establishing'])

    def _add_webhook(self):
        # TODO: Add ability to receive data from this webhook
        call = 'hooks/create'
        parameters = {
            'callbackURL': settings.HOST + '/roulette/webhook_callback',
            'meetingID': str(self.meeting_id),
        }
        add_checksum(call, parameters)
        full_link = settings.BBB_URL + '/bigbluebutton/api/' + \
            call + '?' + urlencode(parameters)
        print(full_link)
        r = requests.get(full_link)
        print(r.content)

    def end_meeting(self, close_session=True):
        parameters = {'meetingID': str(self.meeting_id),
                      'password': self.moderator_pw}
        r = requests.get(self.build_api_request("end", parameters))
        self.ended = True
        self.time_ended = timezone.now()
        if self.match:
            match = self.match
            teacher_request = match.teacher_request
            match.student_request.manual_delete()
            teacher_request.manual_delete()
        self.save()

    def create_join_link(self, user, moderator=False):
        if not self.established:
            self.create_meeting()
        if user in self.users.all() and self.established:
            parameters = {'fullName': user.first_name,
                          'userID': str(user.uuid),
                          # TODO: Play around with this one, to maybe make a request in AJAX possible
                          'redirect': 'true',
                          'meetingID': str(self.meeting_id),
                          'password': self.moderator_pw if moderator else self.attendee_pw
                          }
            return self.build_api_request("join", parameters)
        return None

    def get_meeting_info(self):
        # TODO: Make this API call return an object that makes sense
        call = "getMeetingInfo"
        parameters = {
            'meetingID': str(self.meeting_id)
        }
        return requests.get(build_api_request("join", parameters)).content
