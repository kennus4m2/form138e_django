"""
reportcard/models.py
- birth_date stored; age computed automatically from birth_date
- Attendance stores per-month school days and days present
  matching exactly the DepEd Form 138-E back page layout
"""

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class School(models.Model):
    school_id   = models.AutoField(primary_key=True)
    school_name = models.CharField(max_length=150)
    region      = models.CharField(max_length=50,  default='Region V')
    division    = models.CharField(max_length=100, default='Division of Sorsogon')
    district    = models.CharField(max_length=100, default='Bulan North District')
    address     = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'schools'

    def __str__(self):
        return self.school_name


class SchoolYear(models.Model):
    sy_id    = models.AutoField(primary_key=True)
    sy_label = models.CharField(max_length=20, unique=True)
    sy_start = models.DateField(blank=True, null=True)
    sy_end   = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'school_years'

    def __str__(self):
        return self.sy_label


class Teacher(models.Model):
    ROLE_CHOICES = [
        ('adviser',   'Adviser'),
        ('principal', 'Principal'),
        ('both',      'Both'),
    ]
    teacher_id = models.AutoField(primary_key=True)
    school     = models.ForeignKey(School, on_delete=models.CASCADE, db_column='school_id')
    full_name  = models.CharField(max_length=150)
    position   = models.CharField(max_length=100, blank=True, null=True)
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='adviser')

    class Meta:
        db_table = 'teachers'

    def __str__(self):
        return self.full_name


class Section(models.Model):
    section_id   = models.AutoField(primary_key=True)
    school       = models.ForeignKey(School,     on_delete=models.CASCADE, db_column='school_id')
    school_year  = models.ForeignKey(SchoolYear, on_delete=models.CASCADE, db_column='sy_id')
    grade_level  = models.PositiveSmallIntegerField(
                       validators=[MinValueValidator(1), MaxValueValidator(6)])
    section_name = models.CharField(max_length=50)
    adviser      = models.ForeignKey(Teacher, on_delete=models.SET_NULL,
                                     null=True, blank=True, db_column='adviser_id')

    class Meta:
        db_table = 'sections'

    def __str__(self):
        return f'Grade {self.grade_level} - {self.section_name}'


class Student(models.Model):
    SEX_CHOICES = [('Male', 'Male'), ('Female', 'Female')]

    student_id     = models.AutoField(primary_key=True)
    lrn            = models.CharField(max_length=12, unique=True)
    last_name      = models.CharField(max_length=80)
    first_name     = models.CharField(max_length=80)
    middle_initial = models.CharField(max_length=2, blank=True, null=True)
    sex            = models.CharField(max_length=10, choices=SEX_CHOICES)
    birth_date     = models.DateField(blank=True, null=True)
    school         = models.ForeignKey(School, on_delete=models.CASCADE, db_column='school_id')

    class Meta:
        db_table = 'students'

    def __str__(self):
        return f'{self.last_name}, {self.first_name}'

    def full_name(self):
        mi = f' {self.middle_initial}.' if self.middle_initial else ''
        return f'{self.last_name}, {self.first_name}{mi}'

    def compute_age(self):
        """Auto-compute age from birth_date as of today."""
        if not self.birth_date:
            return ''
        today = timezone.now().date()
        age   = today.year - self.birth_date.year
        if (today.month, today.day) < (self.birth_date.month, self.birth_date.day):
            age -= 1
        return age


class Enrollment(models.Model):
    enrollment_id = models.AutoField(primary_key=True)
    student       = models.ForeignKey(Student,    on_delete=models.CASCADE, db_column='student_id')
    section       = models.ForeignKey(Section,    on_delete=models.CASCADE, db_column='section_id')
    school_year   = models.ForeignKey(SchoolYear, on_delete=models.CASCADE, db_column='sy_id')

    class Meta:
        db_table = 'enrollments'
        unique_together = ('student', 'school_year')

    def __str__(self):
        return f'{self.student} — {self.school_year}'


class LearningArea(models.Model):
    area_id     = models.AutoField(primary_key=True)
    area_code   = models.CharField(max_length=20, unique=True)
    area_name   = models.CharField(max_length=100)
    parent_area = models.ForeignKey('self', on_delete=models.SET_NULL,
                                    null=True, blank=True, db_column='parent_area_id')
    sort_order  = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'learning_areas'
        ordering = ['sort_order']

    def __str__(self):
        return self.area_name


class Grade(models.Model):
    grade_id   = models.AutoField(primary_key=True)
    enrollment = models.ForeignKey(Enrollment,   on_delete=models.CASCADE, db_column='enrollment_id')
    area       = models.ForeignKey(LearningArea, on_delete=models.CASCADE, db_column='area_id')
    q1 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                              validators=[MinValueValidator(0), MaxValueValidator(100)])
    q2 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                              validators=[MinValueValidator(0), MaxValueValidator(100)])
    q3 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                              validators=[MinValueValidator(0), MaxValueValidator(100)])
    q4 = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                              validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        db_table = 'grades'
        unique_together = ('enrollment', 'area')

    def final_grade(self):
        vals = [float(v) for v in [self.q1, self.q2, self.q3, self.q4] if v is not None]
        return round(sum(vals) / len(vals), 2) if vals else 0

    def remarks(self):
        return 'Passed' if self.final_grade() >= 75 else 'Failed'


class CoreValue(models.Model):
    cv_id      = models.AutoField(primary_key=True)
    cv_name    = models.CharField(max_length=80)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'core_values'
        ordering = ['sort_order']

    def __str__(self):
        return self.cv_name


class BehaviorStatement(models.Model):
    bs_id          = models.AutoField(primary_key=True)
    core_value     = models.ForeignKey(CoreValue, on_delete=models.CASCADE,
                                       related_name='statements', db_column='cv_id')
    statement_text = models.CharField(max_length=255)
    sort_order     = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'behavior_statements'
        ordering = ['sort_order']

    def __str__(self):
        return self.statement_text[:60]


class ObservedValue(models.Model):
    RATING_CHOICES = [
        ('AO', 'Always Observed'),
        ('SO', 'Sometimes Observed'),
        ('RO', 'Rarely Observed'),
        ('NO', 'Not Observed'),
    ]
    ov_id      = models.AutoField(primary_key=True)
    enrollment = models.ForeignKey(Enrollment,        on_delete=models.CASCADE, db_column='enrollment_id')
    statement  = models.ForeignKey(BehaviorStatement, on_delete=models.CASCADE, db_column='bs_id')
    q1 = models.CharField(max_length=2, choices=RATING_CHOICES, null=True, blank=True)
    q2 = models.CharField(max_length=2, choices=RATING_CHOICES, null=True, blank=True)
    q3 = models.CharField(max_length=2, choices=RATING_CHOICES, null=True, blank=True)
    q4 = models.CharField(max_length=2, choices=RATING_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'observed_values'
        unique_together = ('enrollment', 'statement')


class Attendance(models.Model):
    """
    Monthly attendance matching the DepEd Form 138-E back page.
    Months: Jun Jul Aug Sep Oct Nov Dec Jan Feb Mar Apr
    Each month stores: number of school days and days present.
    """
    att_id      = models.AutoField(primary_key=True)
    enrollment  = models.OneToOneField(Enrollment, on_delete=models.CASCADE, db_column='enrollment_id')

    jun_school  = models.PositiveSmallIntegerField(default=0)
    jun_present = models.PositiveSmallIntegerField(default=0)
    jul_school  = models.PositiveSmallIntegerField(default=0)
    jul_present = models.PositiveSmallIntegerField(default=0)
    aug_school  = models.PositiveSmallIntegerField(default=0)
    aug_present = models.PositiveSmallIntegerField(default=0)
    sep_school  = models.PositiveSmallIntegerField(default=0)
    sep_present = models.PositiveSmallIntegerField(default=0)
    oct_school  = models.PositiveSmallIntegerField(default=0)
    oct_present = models.PositiveSmallIntegerField(default=0)
    nov_school  = models.PositiveSmallIntegerField(default=0)
    nov_present = models.PositiveSmallIntegerField(default=0)
    dec_school  = models.PositiveSmallIntegerField(default=0)
    dec_present = models.PositiveSmallIntegerField(default=0)
    jan_school  = models.PositiveSmallIntegerField(default=0)
    jan_present = models.PositiveSmallIntegerField(default=0)
    feb_school  = models.PositiveSmallIntegerField(default=0)
    feb_present = models.PositiveSmallIntegerField(default=0)
    mar_school  = models.PositiveSmallIntegerField(default=0)
    mar_present = models.PositiveSmallIntegerField(default=0)
    apr_school  = models.PositiveSmallIntegerField(default=0)
    apr_present = models.PositiveSmallIntegerField(default=0)

    MONTHS = ['jun','jul','aug','sep','oct','nov','dec','jan','feb','mar','apr']

    class Meta:
        db_table = 'attendance'

    def total_school_days(self):
        return sum(getattr(self, f'{m}_school') for m in self.MONTHS)

    def total_present(self):
        return sum(getattr(self, f'{m}_present') for m in self.MONTHS)

    def total_absent(self):
        return self.total_school_days() - self.total_present()

    def monthly_data(self):
        """Return list of dicts for each month for the report card."""
        return [
            {
                'month':   m.capitalize(),
                'school':  getattr(self, f'{m}_school'),
                'present': getattr(self, f'{m}_present'),
                'absent':  getattr(self, f'{m}_school') - getattr(self, f'{m}_present'),
            }
            for m in self.MONTHS
        ]