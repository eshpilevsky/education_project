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
            lastname=lastname
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
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255, unique=True)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    balance = models.IntegerField(default=0)
    room_number = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'firstname', 'lastname']
    objects = UserManager()

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True
