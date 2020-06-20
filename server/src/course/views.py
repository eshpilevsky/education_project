from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Course
from .serializers import CourseSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny


class CourseList(ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class CourseDetail(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'pk'
    permission_classes = [IsAuthenticated]
