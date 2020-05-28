FROM python:3.7
ENV PYTHONUNBUFFERED 1
RUN useradd -ms /bin/bash --home-dir /code educationplatform

COPY requirements.txt /code/
COPY education-platform /code/education-platform

WORKDIR /code

RUN pip install -r requirements.txt
RUN chown -R educationplatform /opt /code
RUN rm -f /code/education-platform/educationplatform/settings_local.py

USER educationplatform
WORKDIR /code/education platform


RUN python3 manage.py collectstatic --noinput
