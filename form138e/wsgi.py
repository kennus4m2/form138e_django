"""
form138e/wsgi.py
WSGI config for form138e project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'form138e.settings')
application = get_wsgi_application()
