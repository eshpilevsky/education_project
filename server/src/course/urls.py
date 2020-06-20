from django.urls import path

from . import views

urlpatterns = [
    path('', views.CourseList.as_view()),
    path('<int:pk>/', views.CourseDetail.as_view()),
]