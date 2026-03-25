# 📋 DepEd Form 138-E Report Card System

A web-based report card management system for Philippine elementary schools built with **Django** and **MySQL**. Generates DepEd Form 138-E (Elementary School Report Card) from a student database using an LRN lookup.

---

## 📸 Screenshots

> Search by LRN → generates a print-ready Form 138-E (front and back page)

| Feature | Description |
|---|---|
| 🔍 Search / Print | Enter student LRN to generate and print the full Form 138-E |
| 👤 Students | View all enrolled students with their general average |
| ➕ Add Student | Add a new student with grades, observed values, and attendance |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+ / Django 4.1 |
| Database | MySQL (via XAMPP / MariaDB) |
| DB Driver | PyMySQL |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Print Layout | CSS `@page` / A4 print stylesheet |

---

## 📁 Project Structure

```
form138e_django/
│
├── manage.py                          # Django entry point
├── requirements.txt                   # Python dependencies
├── form138e_database.sql              # Full database schema + sample data
├── complete_seed_data.sql             # SF1-based seed data (21 students)
│
├── form138e/                          # Django project settings
│   ├── settings.py                    # Database config (update credentials here)
│   ├── urls.py                        # Root URL router
│   └── wsgi.py
│
└── reportcard/                        # Main Django app
    ├── models.py                      # 12 database models (students, grades, etc.)
    ├── views.py                       # API endpoints (search, add, delete)
    ├── urls.py                        # App URL routes
    │
    ├── migrations/                    # Django migration files
    │
    ├── templates/
    │   └── reportcard/
    │       └── index.html             # Main HTML page (Django template)
    │
    └── static/
        └── reportcard/
            ├── style.css              # All UI and print styles
            └── script.js             # Frontend logic + print card builder
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.11 or 3.12 (64-bit recommended)
- XAMPP (with MySQL/MariaDB running)
- Django 4.1
- PyMySQL

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/form138e-system.git
cd form138e-system
```

### Step 2 — Install dependencies

```bash
pip install django==4.1 pymysql
```

### Step 3 — Configure the database

Open `form138e/settings.py` and update the database settings:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME':   'form138e_db',   # your database name
        'USER':   'root',          # XAMPP default
        'PASSWORD': '',            # XAMPP default (no password)
        'HOST':   '127.0.0.1',
        'PORT':   '3306',
    }
}
```

Open `form138e/__init__.py` and make sure it contains:

```python
import pymysql
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()
```

### Step 4 — Create the database in phpMyAdmin

1. Start XAMPP → click **Start** next to MySQL
2. Open `http://localhost/phpmyadmin`
3. Create a new database named `form138e_db`
4. Click **Import** → upload `form138e_database.sql` → click **Go**

### Step 5 — Import seed data (optional)

To load the 21 sample students from the SF1 register:

1. In phpMyAdmin, select `form138e_db`
2. Click **Import** → upload `complete_seed_data.sql` → click **Go**

### Step 6 — Apply Django migrations

```bash
py manage.py migrate --fake-initial
```

> Use `--fake-initial` because the tables were already created by the SQL import.

### Step 7 — Run the server

```bash
py manage.py runserver
```

Open your browser and go to: **http://127.0.0.1:8000/**

---

## 🗄️ Database Schema

The system uses **12 tables** following 3rd Normal Form (3NF):

```
schools             → school information
school_years        → school year labels (e.g. 2025-2026)
teachers            → adviser and principal records
sections            → grade level + section per school year
students            → student personal info (LRN, name, birth date, sex)
enrollments         → links students to sections per school year
learning_areas      → subjects (Filipino, English, MAPEH sub-components, etc.)
grades              → quarterly grades (q1–q4) with auto-computed final grade
core_values         → Maka-Diyos, Makatao, Makakalikasan, Makabansa
behavior_statements → behavior descriptions per core value
observed_values     → AO/SO/RO/NO ratings per student per quarter
attendance          → monthly school days and days present (Jun–Apr)
```

---

## 🔌 API Endpoints

| Method | URL | Description |
|---|---|---|
| GET | `/` | Main page |
| GET | `/api/student/<lrn>/` | Get full report card data for one student |
| GET | `/api/students/` | List all students with general average |
| POST | `/api/students/add/` | Add a new student |
| POST | `/api/students/delete/<lrn>/` | Delete a student |

---

## 📄 Form 138-E Layout

The printed report card matches the official DepEd Form 138-E format:

**Front Page**
- Left: Report on Learning Progress and Achievement (grades table + descriptors)
- Right: Report on Learner's Observed Values (core values + marking legend)

**Back Page**
- Left: Attendance Record (monthly Jun–Apr) + Parent's/Guardian's Signature
- Right: School cover info (name, LRN, grade, section, school year, age, sex) + Certificate of Transfer

---

## 📐 Grading System

| Descriptor | Grading Scale | Remarks |
|---|---|---|
| Outstanding | 90 – 100 | Passed |
| Very Satisfactory | 85 – 89 | Passed |
| Satisfactory | 80 – 84 | Passed |
| Fairly Satisfactory | 75 – 79 | Passed |
| Did Not Meet Expectations | Below 75 | Failed |

- **MAPEH** final grade is automatically computed as the average of Music, Arts, Physical Education, and Health
- **General Average** is computed from all main subjects (MAPEH sub-components excluded)
- **Age** is automatically computed from birth date

---

## 📚 Lessons Applied (Information Management)

This project was built as a practical application of the following database concepts:

1. **Business Rules** — Structural, Operational, Integrity, and Derivation rules applied throughout the schema
2. **Normalization** — Schema follows 1NF, 2NF, and 3NF (no redundant data)
3. **Constraints & Aggregate Functions** — `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`, `DEFAULT`, plus `AVG()`, `COUNT()`, `SUM()`, `MAX()`, `MIN()`
4. **SQL JOIN** — `INNER JOIN` and `LEFT JOIN` used across all API queries

---

## 🚀 Features

- 🔍 **LRN Lookup** — Search any student by their 12-digit Learner Reference Number
- 🖨️ **Print-ready** — Generates a properly formatted Form 138-E for direct printing (A4)
- ➕ **Add Students** — Full form with birth date (auto-computes age), grades, observed values, and attendance
- 📊 **Auto-computed grades** — Final grade, MAPEH average, general average, and remarks all computed automatically
- 🗑️ **Delete Students** — Remove students and all related records (cascade)
- 📅 **Full attendance tracking** — Monthly attendance (Jun–Apr) with school days, days present, and days absent

---

## 🛠 Troubleshooting

| Problem | Solution |
|---|---|
| `Table already exists` on migrate | Run `py manage.py migrate --fake-initial` |
| `mysqlclient 2.2.1 or newer required` | Add `pymysql.version_info = (2, 2, 1, "final", 0)` to `__init__.py` |
| `Could not connect to server` on website | Make sure XAMPP MySQL is running |
| `Could not load students` | Check that the SQL was imported correctly in phpMyAdmin |
| Static files (CSS/JS) not loading | Run `py manage.py collectstatic` |
| `MariaDB 10.6 or later required` | Use Django 4.1: `pip install django==4.1` |

---

## 👩‍💻 Developer

Built by **Nickson M. Formento**
Subject: Information Management
School:  M. A. Roxas Elementary School / Inararan Elementary School

---

## 📜 License

This project is for academic and educational use only.
