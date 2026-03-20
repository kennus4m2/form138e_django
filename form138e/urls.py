"""
form138e/urls.py
Main URL configuration — routes to the reportcard app
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('reportcard.urls')),   # all reportcard routes
]
