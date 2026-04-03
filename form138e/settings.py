"""
form138e/settings.py
Django settings for DepEd Form 138-E Report Card System
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-form138e-change-this-in-production-abc123xyz'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'reportcard',          # our main app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'form138e.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'form138e.wsgi.application'

# ================================================================
#  DATABASE — MySQL via XAMPP
#  Make sure XAMPP MySQL is running before starting Django.
#
#  Steps:
#   1. Open XAMPP Control Panel → Start MySQL
#   2. Open phpMyAdmin → create a database named: form138e_db
#   3. Import form138e_database.sql into that database
#   4. Update NAME, USER, PASSWORD below if needed
# ================================================================
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.mysql',
        'NAME':     'form138e_db',       # your database name in phpMyAdmin
        'USER':     'root',              # default XAMPP MySQL user
        'PASSWORD': '',                  # default XAMPP MySQL has no password
        'HOST':     '127.0.0.1',
        'PORT':     '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Asia/Manila'
USE_I18N      = True
USE_TZ        = True

STATIC_URL = '/static/'

# Needed for {% static %} tag to resolve app static files
STATICFILES_DIRS = [
    BASE_DIR / 'reportcard' / 'static',
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'