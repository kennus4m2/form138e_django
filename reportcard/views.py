"""
reportcard/views.py
- Age auto-computed from birth_date
- Attendance returns full monthly breakdown for report card
"""

import json
from django.shortcuts import render
from django.http      import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db        import transaction

from .models import (
    School, SchoolYear, Teacher, Section, Student,
    Enrollment, LearningArea, Grade,
    CoreValue, BehaviorStatement, ObservedValue, Attendance
)

MAPEH_CODE = 'MAPEH'
MAPEH_SUBS = ['MUS', 'ARTS', 'PE', 'HLT']


def compute_mapeh(grades_dict):
    mapeh_q = []
    for qi in range(4):
        total = sum(float(grades_dict.get(c, [0,0,0,0])[qi] or 0) for c in MAPEH_SUBS)
        mapeh_q.append(round(total / 4))
    return mapeh_q


def build_grade_row(area, grades_dict):
    code    = area.area_code
    q       = compute_mapeh(grades_dict) if code == MAPEH_CODE else \
              [float(v) if v else 0 for v in grades_dict.get(code, [0,0,0,0])]
    is_main = area.parent_area is None
    final   = round(sum(q) / 4, 2) if is_main else None
    remarks = ('Passed' if final >= 75 else 'Failed') if final is not None else None
    return {
        'area_id':    area.area_id,
        'area_code':  code,
        'area_name':  area.area_name,
        'is_main':    is_main,
        'q1': q[0], 'q2': q[1], 'q3': q[2], 'q4': q[3],
        'final_grade': final,
        'remarks':     remarks,
    }


# ── Main page ─────────────────────────────────────────────────
def index(request):
    return render(request, 'reportcard/index.html')


# ── GET student report card ───────────────────────────────────
def get_student(request, lrn):
    try:
        student    = Student.objects.select_related('school').get(lrn=lrn)
        enrollment = Enrollment.objects.select_related(
                         'section__adviser', 'school_year').get(student=student)
        section    = enrollment.section
        adviser    = section.adviser
    except Student.DoesNotExist:
        return JsonResponse({'error': f'LRN {lrn} not found.'}, status=404)
    except Enrollment.DoesNotExist:
        return JsonResponse({'error': f'No enrollment found for LRN {lrn}.'}, status=404)

    # Grades
    grades_dict = {g.area.area_code: [g.q1, g.q2, g.q3, g.q4]
                   for g in Grade.objects.filter(enrollment=enrollment).select_related('area')}
    areas      = LearningArea.objects.all().order_by('sort_order')
    grade_rows = [build_grade_row(a, grades_dict) for a in areas]
    main_finals = [r['final_grade'] for r in grade_rows if r['is_main'] and r['final_grade'] is not None]
    gen_avg     = round(sum(main_finals) / len(main_finals), 3) if main_finals else 0

    # Observed values
    obs_db = {ov.statement_id: ov for ov in ObservedValue.objects.filter(enrollment=enrollment)}
    values_data = []
    for cv in CoreValue.objects.prefetch_related('statements').order_by('sort_order'):
        for bs in cv.statements.order_by('sort_order'):
            ov = obs_db.get(bs.bs_id)
            values_data.append({
                'cv_name':   cv.cv_name,
                'bs_id':     bs.bs_id,
                'statement': bs.statement_text,
                'q1': ov.q1 if ov else '—',
                'q2': ov.q2 if ov else '—',
                'q3': ov.q3 if ov else '—',
                'q4': ov.q4 if ov else '—',
            })

    # Attendance — monthly breakdown
    att = None
    try:
        att_obj = Attendance.objects.get(enrollment=enrollment)
        att = {
            'monthly':           att_obj.monthly_data(),
            'total_school_days': att_obj.total_school_days(),
            'total_present':     att_obj.total_present(),
            'total_absent':      att_obj.total_absent(),
        }
    except Attendance.DoesNotExist:
        # Return blank monthly structure if no attendance recorded yet
        months = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']
        att = {
            'monthly': [{'month': m, 'school': 0, 'present': 0, 'absent': 0} for m in months],
            'total_school_days': 0,
            'total_present': 0,
            'total_absent': 0,
        }

    return JsonResponse({
        'lrn':             student.lrn,
        'full_name':       student.full_name(),
        'last_name':       student.last_name,
        'first_name':      student.first_name,
        'mi':              student.middle_initial or '',
        'sex':             student.sex,
        'birth_date':      str(student.birth_date) if student.birth_date else '',
        'age':             student.compute_age(),
        'grade':           section.grade_level,
        'section':         section.section_name,
        'sy':              enrollment.school_year.sy_label,
        'school':          student.school.school_name,
        'adviser':         adviser.full_name if adviser else '',
        'adviser_pos':     adviser.position  if adviser else '',
        'principal':       'LUCIEN S. SOMALINOG',
        'principal_pos':   'ESHT 3',
        'grades':          grade_rows,
        'general_average': gen_avg,
        'overall_remarks': 'Passed' if gen_avg >= 75 else 'Failed',
        'values':          values_data,
        'attendance':      att,
    })


# ── GET all students ──────────────────────────────────────────
def list_students(request):
    students = []
    for student in Student.objects.select_related('school').all():
        try:
            enrollment  = Enrollment.objects.select_related('section','school_year').get(student=student)
            grades_dict = {g.area.area_code: [g.q1,g.q2,g.q3,g.q4]
                           for g in Grade.objects.filter(enrollment=enrollment).select_related('area')}
            areas       = LearningArea.objects.filter(parent_area=None).order_by('sort_order')
            main_finals = [build_grade_row(a, grades_dict)['final_grade']
                           for a in areas if build_grade_row(a, grades_dict)['final_grade'] is not None]
            gen_avg     = round(sum(main_finals)/len(main_finals), 3) if main_finals else 0
            students.append({
                'student_id':      student.student_id,
                'lrn':             student.lrn,
                'full_name':       student.full_name(),
                'last_name':       student.last_name,
                'first_name':      student.first_name,
                'mi':              student.middle_initial or '',
                'sex':             student.sex,
                'birth_date':      str(student.birth_date) if student.birth_date else '',
                'age':             student.compute_age(),
                'grade':           enrollment.section.grade_level,
                'section':         enrollment.section.section_name,
                'sy':              enrollment.school_year.sy_label,
                'general_average': gen_avg,
                'remarks':         'Passed' if gen_avg >= 75 else 'Failed',
            })
        except Enrollment.DoesNotExist:
            students.append({
                'student_id':      student.student_id,
                'lrn':             student.lrn,
                'full_name':       student.full_name(),
                'last_name':       student.last_name,
                'first_name':      student.first_name,
                'mi':              student.middle_initial or '',
                'sex':             student.sex,
                'birth_date':      '',
                'age':             '',
                'grade':           '',
                'section':         '',
                'sy':              '',
                'general_average': 0,
                'remarks':         '—',
            })
    return JsonResponse({'students': students})


# ── POST add student ──────────────────────────────────────────
@csrf_exempt
def add_student(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    lrn        = data.get('lrn', '').strip()
    last_name  = data.get('lastName', '').strip()
    first_name = data.get('firstName', '').strip()
    birth_date = data.get('birthDate', '').strip()

    if not lrn or len(lrn) != 12:
        return JsonResponse({'error': 'LRN must be exactly 12 digits.'}, status=400)
    if not last_name or not first_name:
        return JsonResponse({'error': 'Last name and first name are required.'}, status=400)
    if not birth_date:
        return JsonResponse({'error': 'Birth date is required.'}, status=400)
    if Student.objects.filter(lrn=lrn).exists():
        return JsonResponse({'error': f'LRN {lrn} already exists.'}, status=400)

    try:
        with transaction.atomic():
            school, _ = School.objects.get_or_create(
                school_name=data.get('school', 'INARARAN ELEMENTARY SCHOOL'))
            sy, _ = SchoolYear.objects.get_or_create(
                sy_label=data.get('sy', '2016-2017'))
            adviser = Teacher.objects.filter(role='adviser').first()
            section, _ = Section.objects.get_or_create(
                school=school, school_year=sy,
                grade_level=int(data.get('grade', 5)),
                section_name=data.get('section', 'One'),
                defaults={'adviser': adviser})

            student = Student.objects.create(
                lrn=lrn, last_name=last_name, first_name=first_name,
                middle_initial=data.get('mi', '') or None,
                sex=data.get('sex', 'Male'),
                birth_date=birth_date,
                school=school)

            enrollment = Enrollment.objects.create(
                student=student, section=section, school_year=sy)

            # Grades
            grades_data = data.get('grades', {})
            for area in LearningArea.objects.all():
                q_vals = grades_data.get(area.area_code, [0,0,0,0])
                Grade.objects.create(
                    enrollment=enrollment, area=area,
                    q1=q_vals[0], q2=q_vals[1], q3=q_vals[2], q4=q_vals[3])

            # Observed values
            values_data = data.get('values', {})
            for cv in CoreValue.objects.prefetch_related('statements').all():
                for bs in cv.statements.all():
                    ratings = values_data.get(str(bs.bs_id), ['AO','AO','AO','AO'])
                    ObservedValue.objects.create(
                        enrollment=enrollment, statement=bs,
                        q1=ratings[0], q2=ratings[1], q3=ratings[2], q4=ratings[3])

            # Attendance — save monthly data
            att_data = data.get('attendance', {})
            months   = ['jun','jul','aug','sep','oct','nov','dec','jan','feb','mar','apr']
            att_fields = {}
            for m in months:
                att_fields[f'{m}_school']  = int(att_data.get(f'{m}_school',  0) or 0)
                att_fields[f'{m}_present'] = int(att_data.get(f'{m}_present', 0) or 0)
            Attendance.objects.create(enrollment=enrollment, **att_fields)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'success': True, 'message': f'Student {first_name} {last_name} saved.'})


# ── POST delete student ───────────────────────────────────────
@csrf_exempt
def delete_student(request, lrn):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required.'}, status=405)
    try:
        student = Student.objects.get(lrn=lrn)
        name    = student.full_name()
        student.delete()
        return JsonResponse({'success': True, 'message': f'{name} deleted.'})
    except Student.DoesNotExist:
        return JsonResponse({'error': f'LRN {lrn} not found.'}, status=404)