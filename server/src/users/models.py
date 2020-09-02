from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, username, firstname, lastname, password=None):
        if not username:
            raise ValueError('Пользователь должен иметь имя пользователя')
        if not email:
            raise ValueError('Пользователь должен иметь адрес электронной почты')
        if not firstname:
            raise ValueError('У пользователя должно быть имя')
        if not lastname:
            raise ValueError('У пользователя должна быть фамилия')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            firstname=firstname,
            lastname=lastname,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, email, username, firstname, lastname, password=None):
        user = self.create_user(
            email,
            password=password,
            username=username,
            firstname=firstname,
            lastname=lastname
        )
        user.is_staff = True
        user.is_active = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, firstname, lastname, password=None):
        user = self.create_user(
            email,
            password=password,
            username=username,
            firstname=firstname,
            lastname=lastname
        )
        user.is_staff = True
        user.is_admin = True
        user.is_active = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    BELARUS = 'BY'
    RUSSIA = 'RU'
    UKRAINE = 'UA'

    COUNTRY = [
        (BELARUS, 'Belarus'),
        (RUSSIA, 'Russia'),
        (UKRAINE, 'Ukraine'),
    ]

    country = models.CharField(
        max_length=2,
        choices=COUNTRY,
    )

    BYN = 'BYN'
    RUB = 'RUB'
    USD = 'USD'

    CURRENCY = [
        (BYN, 'BYN'),
        (RUB, 'RUB'),
        (USD, 'USD'),
    ]

    currency = models.CharField(
        max_length=3,
        choices=CURRENCY,
    )

    student_group = models.ForeignKey('StudentGroup', on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255, unique=True)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    balance = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'firstname', 'lastname']
    objects = UserManager()

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True


class StudentGroup(models.Model):
    name = models.CharField(max_length=70)
    subject = models.OneToOneField('Subject', on_delete=models.CASCADE)
    group_level = models.OneToOneField('GroupLevel', on_delete=models.CASCADE)

    MORNING = 'MORNING'
    DAY = 'DAY'
    EVENING = 'EVENING'

    CLASS_TIME = [
        (MORNING, 'MORNING'),
        (DAY, 'DAY'),
        (EVENING, 'EVENING'),
    ]

    class_time = models.CharField(
        max_length=10,
        choices=CLASS_TIME,
    )

    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now_add=True)
    description = models.TextField()

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=300)

    def __str__(self):
        return self.name


class GroupLevel(models.Model):
    JUNIOR = 'JUNIOR'
    MIDDLE = 'MIDDLE'
    SENIOR = 'SENIOR'

    LEVEL = [
        (JUNIOR, 'JUNIOR'),
        (MIDDLE, 'MIDDLE'),
        (SENIOR, 'SENIOR'),
    ]

    level = models.CharField(
        max_length=6,
        choices=LEVEL,
    )

    def __str__(self):
        return self.level


class Lesson(models.Model):
    student_group = models.ForeignKey('StudentGroup', on_delete=models.CASCADE)
    date = models.DateField()
    start = models.TimeField()
    end = models.TimeField()
    title = models.CharField(max_length=100, blank=True, null=True)
    room_link = models.URLField(unique=True)

    def __str__(self):
        start_time = self.start.strftime("%H:%M")  # '07:00'
        end_time = self.end.strftime("%H:%M")      # '07:50'
        return "{} ({} - {})".format(self.title, start_time, end_time)