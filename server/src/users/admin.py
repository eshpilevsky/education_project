from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentGroup, Subject, GroupLevel

admin.site.register(User)
admin.site.register(StudentGroup)
admin.site.register(Subject)
admin.site.register(GroupLevel)