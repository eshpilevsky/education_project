from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.translation import gettext_lazy as _
from drf_base64.fields import Base64FileField, Base64ImageField
from drf_base64.serializers import ModelSerializer
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from account.managers import CustomUserManager
from account.models import (CustomUser, PasswordResetToken, SchoolData,
                            SchoolType, State, StudentData, Subject, TeacherData)


class DynamicFieldsModelSerializer(ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'


class SchoolTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolType
        fields = '__all__'


class SchoolDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolData
        fields = '__all__'


class StudentDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentData
        fields = ['school_data']


class TeacherDataSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = TeacherData
        fields = ['schooldata', 'subjects',
                  'verification_file', 'verified', 'profile_picture']
        read_only_fields = ['verified']


class CurrentUserSerializer(serializers.ModelSerializer):
    studentdata = StudentDataSerializer(required=False, allow_null=True)
    teacherdata = TeacherDataSerializer(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ['uuid', 'email', 'email_verified', 'first_name', 'last_name', 'gender',
                  'state', 'password', 'studentdata', 'teacherdata']
        read_only_fields = ['email_verified']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        studentdata = None
        teacherdata = None

        if 'studentdata' in validated_data:
            studentdata = validated_data.pop('studentdata')
        if 'teacherdata' in validated_data:
            teacherdata = validated_data.pop('teacherdata')

        # Create user, then set studentdata and teacherdata if exists
        instance = CustomUser.objects.create_user(**validated_data)
        if studentdata:
            StudentData.objects.update_or_create(user=instance, **studentdata)
        if teacherdata:
            teacher, _ = TeacherData.objects.get_or_create(user=instance)
            teacher.schooldata.set(teacherdata.get('schooldata'))
            teacher.subjects.set(teacherdata.get('subjects'))
            teacher.verification_file = teacherdata.get('verification_file')
            teacher.profile_picture = teacherdata.get('profile_picture')
            teacher.save()

        return instance

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        if 'studentdata' in validated_data:
            data = validated_data.pop('studentdata')
            if not data:
                StudentData.objects.filter(user=instance).delete()
            else:
                StudentData.objects.update_or_create(user=instance, defaults=data)
        if 'teacherdata' in validated_data:
            data = validated_data.pop('teacherdata')
            if not data:
                TeacherData.objects.filter(user=instance).delete()
            else:
                teacherdata, _ = TeacherData.objects.get_or_create(user=instance)
                teacherdata.schooldata.set(data.get('schooldata'))
                teacherdata.subjects.set(data.get('subjects'))
                if data.get('verification_file'):
                    teacherdata.verification_file = data.get('verification_file')
                if data.get('profile_picture'):
                    teacherdata.profile_picture = data.get('profile_picture')
                teacherdata.save()
        return super(CurrentUserSerializer, self).update(instance, validated_data)

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            if self.instance.email != value:
                raise serializers.ValidationError("User with this mail already exists!")
        return value


class CustomUserSerializer(serializers.ModelSerializer):
    teacherdata = TeacherDataSerializer(fields=['schooldata', 'subjects', 'profile_picture'])
    studentdata = StudentDataSerializer()

    class Meta:
        model = CustomUser
        fields = ["uuid", "first_name",
                  "state", "studentdata", "teacherdata", "gender"]
        lookup_field = "uuid"


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        user = get_user_model().objects.filter(email=value)
        if user.exists():
            return value
        else:
            raise serializers.ValidationError(
                _("No user found with this email!"))

    def save(self):
        user = CustomUser.objects.get(email=self.validated_data['email'])
        user.send_reset_mail()
