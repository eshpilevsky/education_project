from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=70)
    slug = models.SlugField()
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    preview = models.ImageField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'course'
        verbose_name_plural = 'courses'
