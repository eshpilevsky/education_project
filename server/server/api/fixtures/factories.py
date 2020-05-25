import datetime
from django.contrib.auth import get_user_model
from factory import (
    LazyAttribute,
    LazyFunction,
    Sequence,
    SubFactory,
)
from factory.django import DjangoModelFactory
from faker import Faker

delta = datetime.timedelta
now = datetime.datetime.now

fake = Faker()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = get_user_model()

    email = LazyAttribute(lambda o: '{username}@123.com'.format(username=o.username))
    first_name = LazyFunction(fake.first_name)
    last_name = LazyFunction(fake.last_name)
    username = Sequence(lambda n: '{}{}'.format(fake.user_name(), n))
