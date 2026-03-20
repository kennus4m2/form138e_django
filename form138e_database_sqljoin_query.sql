-- ================================================================
-- LESSON 3: AGGREGATE FUNCTIONS
-- ================================================================
-- Aggregate functions compute a single result from multiple rows.
--   COUNT() -> counts number of rows
--   SUM()   -> adds up values
--   AVG()   -> computes the average
--   MAX()   -> returns the highest value
--   MIN()   -> returns the lowest value
-- Used with GROUP BY to group results by a category.
-- ================================================================

-- Count total number of students
SELECT COUNT(*) AS total_students
FROM students;

-- Count male and female students
SELECT sex, COUNT(*) AS COUNT
FROM students
GROUP BY sex;

-- Get each student's general average (main subjects only)
SELECT
    s.lrn,
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    ROUND(AVG(g.final_grade), 2)            AS general_average
FROM students s
JOIN enrollments e     ON e.student_id    = s.student_id
JOIN grades g          ON g.enrollment_id = e.enrollment_id
JOIN learning_areas la ON la.area_id      = g.area_id
WHERE la.parent_area_id IS NULL
GROUP BY s.student_id, s.lrn, s.last_name, s.first_name;

-- Highest, lowest, and average grade in Filipino (area_id = 1)
SELECT
    MAX(g.final_grade) AS highest_grade,
    MIN(g.final_grade) AS lowest_grade,
    AVG(g.final_grade) AS class_average
FROM grades g
WHERE g.area_id = 1;

-- Count passed and failed students per subject
SELECT
    la.area_name,
    SUM(CASE WHEN g.remarks = 'Passed' THEN 1 ELSE 0 END) AS passed,
    SUM(CASE WHEN g.remarks = 'Failed' THEN 1 ELSE 0 END) AS failed
FROM grades g
JOIN learning_areas la ON la.area_id = g.area_id
WHERE la.parent_area_id IS NULL
GROUP BY la.area_name
ORDER BY la.sort_order;

-- Total school days, days present, and days absent per student
-- Derivation Rule: days_absent = school_days - days_present
SELECT
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    (a.jun_school + a.jul_school + a.aug_school + a.sep_school +
     a.oct_school + a.nov_school + a.dec_school + a.jan_school +
     a.feb_school + a.mar_school)             AS total_school_days,
    (a.jun_present + a.jul_present + a.aug_present + a.sep_present +
     a.oct_present + a.nov_present + a.dec_present + a.jan_present +
     a.feb_present + a.mar_present)           AS total_days_present,
    ((a.jun_school + a.jul_school + a.aug_school + a.sep_school +
      a.oct_school + a.nov_school + a.dec_school + a.jan_school +
      a.feb_school + a.mar_school) -
     (a.jun_present + a.jul_present + a.aug_present + a.sep_present +
      a.oct_present + a.nov_present + a.dec_present + a.jan_present +
      a.feb_present + a.mar_present))         AS total_days_absent
FROM attendance a
JOIN enrollments e ON e.enrollment_id = a.enrollment_id
JOIN students s    ON s.student_id    = e.student_id;


-- ================================================================
-- LESSON 4: SQL JOIN
-- ================================================================
-- JOIN combines rows from two or more tables based on a shared column.
--
--   INNER JOIN -> returns only rows that match in both tables
--   LEFT JOIN  -> returns all rows from the left table; unmatched
--                 rows from the right table show NULL
-- ================================================================

-- INNER JOIN: student name + section + school year
SELECT
    s.lrn,
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    sec.grade_level,
    sec.section_name,
    sy.sy_label
FROM students s
INNER JOIN enrollments e   ON e.student_id   = s.student_id
INNER JOIN sections sec    ON sec.section_id  = e.section_id
INNER JOIN school_years sy ON sy.sy_id        = e.sy_id;

-- INNER JOIN: student name + subject + quarterly grades
SELECT
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    la.area_name                             AS SUBJECT,
    g.q1, g.q2, g.q3, g.q4,
    g.final_grade,
    g.remarks
FROM students s
INNER JOIN enrollments e   ON e.student_id    = s.student_id
INNER JOIN grades g        ON g.enrollment_id  = e.enrollment_id
INNER JOIN learning_areas la ON la.area_id    = g.area_id
WHERE la.parent_area_id IS NULL
ORDER BY s.last_name, la.sort_order;

-- INNER JOIN: full report card for one student by LRN
SELECT
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    s.lrn,
    sec.grade_level,
    sec.section_name,
    sy.sy_label,
    t.full_name                             AS adviser,
    la.area_name                            AS SUBJECT,
    g.q1, g.q2, g.q3, g.q4,
    g.final_grade,
    g.remarks
FROM students s
INNER JOIN enrollments e    ON e.student_id    = s.student_id
INNER JOIN sections sec     ON sec.section_id   = e.section_id
INNER JOIN school_years sy  ON sy.sy_id         = e.sy_id
INNER JOIN teachers t       ON t.teacher_id     = sec.adviser_id
INNER JOIN grades g         ON g.enrollment_id  = e.enrollment_id
INNER JOIN learning_areas la ON la.area_id      = g.area_id
WHERE s.lrn = '114014110013'
  AND la.parent_area_id IS NULL
ORDER BY la.sort_order;

-- LEFT JOIN: all students and their grades
-- (students with no grades will show NULL in grade columns)
SELECT
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    la.area_name                             AS SUBJECT,
    g.final_grade,
    g.remarks
FROM students s
LEFT JOIN enrollments e    ON e.student_id   = s.student_id
LEFT JOIN grades g         ON g.enrollment_id = e.enrollment_id
LEFT JOIN learning_areas la ON la.area_id    = g.area_id
ORDER BY s.last_name, la.sort_order;

-- JOIN + Aggregate: general average, highest, and lowest grade per student
SELECT
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    ROUND(AVG(g.final_grade), 3)            AS general_average,
    MAX(g.final_grade)                      AS highest_grade,
    MIN(g.final_grade)                      AS lowest_grade,
    IF(AVG(g.final_grade) >= 75, 'Passed', 'Failed') AS overall_result
FROM students s
INNER JOIN enrollments e    ON e.student_id    = s.student_id
INNER JOIN grades g         ON g.enrollment_id = e.enrollment_id
INNER JOIN learning_areas la ON la.area_id     = g.area_id
WHERE la.parent_area_id IS NULL
GROUP BY s.student_id, s.last_name, s.first_name
ORDER BY general_average DESC;

-- JOIN: student name + observed core values and ratings
SELECT
    CONCAT(s.last_name, ', ', s.first_name) AS student_name,
    cv.cv_name                               AS core_value,
    bs.statement_text                        AS behavior,
    ov.q1, ov.q2, ov.q3, ov.q4
FROM students s
INNER JOIN enrollments e          ON e.student_id    = s.student_id
INNER JOIN observed_values ov     ON ov.enrollment_id = e.enrollment_id
INNER JOIN behavior_statements bs ON bs.bs_id         = ov.bs_id
INNER JOIN core_values cv         ON cv.cv_id         = bs.cv_id
ORDER BY s.last_name, cv.sort_order, bs.sort_order;
