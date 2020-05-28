from django.db import models


class InterestedIndividual(models.Model):
    TEACHER = 'TE'
    PARENT = 'PA'
    STUDENT = 'ST'
    TYPE_CHOICES = [
        (TEACHER, 'Teacher'),
        (PARENT, 'Parent'),
        (STUDENT, 'Student')
    ]

    email = models.EmailField(max_length=254, unique=True)
    updates = models.BooleanField(default=False)
    ind_type = models.CharField(max_length=2, choices=TYPE_CHOICES)
