from django.core.management.base import BaseCommand
from roulette.models import StudentRequest, TeacheRequest
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = "deletes requests that haven't been polled since 30 seconds"

    def handle(self, *args, **options):
        r = StudentRequest.objects.filter(
            last_poll__lte=timezone.now()-timedelta(seconds=20)).filter(is_active=True)
        for i in r:
            i.deactivate()
        r = TeacherRequest.objects.filter(
            last_poll__lte=timezone.now()-timedelta(seconds=60)).filter(is_active=True)
        for i in r:
            i.deactivate()