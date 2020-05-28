from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext as _

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import (CustomUser, SchoolData, SchoolType, State, StudentData,
                     Subject, TeacherData)
from django.http import HttpResponse
import csv

admin.site.register(SchoolData)
admin.site.register(SchoolType)
admin.site.register(State)
admin.site.register(Subject)

class ExportCsvMixin:
    def export_csv(self, request, queryset):

        meta = self.model._meta
        field_names = [field.name for field in meta.fields if field.name != "password"]
        field_names.append("type")

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([self.get_data(obj, field) for field in field_names])

        return response

    export_csv.short_description = "CSV exportieren"

    def get_data(self, obj, field):
        if field == "type":
            if hasattr(obj, "teacherdata"):
                return "teacher"
            elif hasattr(obj, "studentdata"):
                return "student"
            else:
                return "nothing"
        else:
            return getattr(obj, field)

class StudentDataInline(admin.StackedInline):
    model = StudentData
    verbose_name = "Student data"
    verbose_name_plural = verbose_name


class TeacherDataInline(admin.StackedInline):
    model = TeacherData
    verbose_name = "Teacher data"
    verbose_name_plural = verbose_name
    fields = ['schooldata', 'subjects', 'verified',
              'verification_file', 'profile_picture', 'image_tag']
    readonly_fields = ['image_tag']


class TeacherDataFilter(admin.SimpleListFilter):
    title = _('Teacher')

    parameter_name = 'is_teacher'

    def lookups(self, request, model_admin):
        return (('not_null', _('Yes')),
                ('null', _('No')))

    def queryset(self, request, queryset):
        if self.value() == 'null':
            return queryset.filter(teacherdata__isnull=True)
        elif self.value() == 'not_null':
            return queryset.filter(teacherdata__isnull=False)


class StudentDataFilter(admin.SimpleListFilter):
    title = _('Student')

    parameter_name = 'is_student'

    def lookups(self, request, model_admin):
        return (('not_null', _('Yes')),
                ('null', _('No')))
    def queryset(self, request, queryset):
        if self.value() == 'null':
            return queryset.filter(studentdata__isnull=True)
        elif self.value() == 'not_null':
            return queryset.filter(studentdata__isnull=False)


class UnverifiedTeacherFilter(admin.SimpleListFilter):
    title = _('Is a verified teacher')

    parameter_name = 'verified_teacher'

    def lookups(self, request, model_admin):
        return (('yes', _('Unverified')),
                ('no', _('Verified')))

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(teacherdata__isnull=False).filter(teacherdata__verified=False)
        elif self.value() == 'no':
            return queryset.filter(teacherdata__isnull=False).filter(teacherdata__verified=True)


class CustomUserAdmin(UserAdmin, ExportCsvMixin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    inlines = [
        StudentDataInline,
        TeacherDataInline
    ]
    list_display = ('email', 'first_name', 'last_name',
                    'state', 'is_staff', 'is_active', 'is_teacher', 'is_student', 'email_verified', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'email_verified', UnverifiedTeacherFilter, StudentDataFilter, TeacherDataFilter, 'state'
                   )
    fieldsets = (
        (None, {'fields':
                ('email', 'email_verified', 'first_name', 'last_name', 'gender', 'state', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': (
                'wide',), 'fields': (
                'email', 'first_name', 'state', 'password1', 'password2',
                    'is_staff', 'is_active')}), )
    search_fields = ('email',)
    ordering = ['-date_joined']
    actions = ("export_csv", )


admin.site.register(CustomUser, CustomUserAdmin)
