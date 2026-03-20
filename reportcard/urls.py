"""
reportcard/urls.py
URL routes for the reportcard app.

Routes:
  GET  /                          → main page (index.html)
  GET  /api/student/<lrn>/        → fetch report card for one student
  GET  /api/students/             → list all students
  POST /api/students/add/         → add a new student
  POST /api/students/delete/<lrn>/→ delete a student
"""

from django.urls import path
from . import views

urlpatterns = [
    # Main page
    path('', views.index, name='index'),

    # API endpoints
    path('api/student/<str:lrn>/',         views.get_student,    name='get_student'),
    path('api/students/',                  views.list_students,  name='list_students'),
    path('api/students/add/',              views.add_student,    name='add_student'),
    path('api/students/delete/<str:lrn>/', views.delete_student, name='delete_student'),
]
