from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone = models.CharField("Телефонный номер", max_length=16, blank=True, null=True)
    phone_is_confirmed = models.BooleanField("Подтверждение телефона", default=False)
