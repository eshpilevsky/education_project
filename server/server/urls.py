from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView
from rest_framework_swagger.views import get_swagger_view

schema_view = get_swagger_view(title='Education Platform API')

urlpatterns = [
    url(r'^$', schema_view),
    url(r'^api/', include('server.api.urls')),
    url(r'^auth/', include('rest_auth.urls')),
    url(r'^registration/', include('rest_auth.registration.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^$', TemplateView.as_view(template_name="index.html"), name='index'),
]
