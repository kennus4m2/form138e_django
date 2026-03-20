-- ================================================================
--  DEPED FORM 138-E  |  Report Card Database
--  School: M.A. Roxas Elementary School
--  Compatible with: MySQL 8+ / MariaDB 10.5+
--
--  LESSONS COVERED IN THIS FILE:
--    1. Business Rules
--    2. Normalization (1NF, 2NF, 3NF)
--    3. Constraints & Aggregate Functions
--    4. SQL JOIN
-- ================================================================


-- ================================================================
-- LESSON 1: BUSINESS RULES
-- ================================================================
-- Business Rules are approved guidelines that define or constrain
-- how data is structured and how the system behaves.
--
-- A. STRUCTURAL RULES (Data Structure Rules)
--    - A student can enroll in many subjects (many-to-many)
--    - Each grade record must belong to one student enrollment
--    - Each student must have only one unique LRN
--    - A section must belong to one school and one school year
--
-- B. OPERATIONAL RULES (Behaviour Rules)
--    - A student cannot be enrolled twice in the same school year
--    - Grades can only be entered for enrolled students
--
-- C. INTEGRITY RULES (Data Validity Rules)
--    - LRN must be exactly 12 characters and unique
--    - Grade values must be between 0 and 100
--    - Student sex must only be 'Male' or 'Female'
--    - Names cannot be empty (NOT NULL)
--    - Passing grade is 75 and above
--
-- D. DERIVATION RULES (Computed Rules)
--    - final_grade = (q1 + q2 + q3 + q4) / 4
--    - remarks     = IF final_grade >= 75 THEN 'Passed' ELSE 'Failed'
--    - MAPEH grade = average of Music, Arts, P.E., and Health
-- ================================================================


-- ================================================================
-- LESSON 2: NORMALIZATION
-- ================================================================
-- Normalization removes data redundancy and ensures data integrity.
-- This schema follows up to 3rd Normal Form (3NF).
--
-- 1NF (First Normal Form):
--   - Every table has a primary key
--   - Each column holds only one value (atomic)
--   - Example: student name is split into last_name and first_name
--
-- 2NF (Second Normal Form):
--   - No partial dependencies
--   - Example: school info is in its own 'schools' table,
--              not repeated in every student row
--
-- 3NF (Third Normal Form):
--   - No transitive dependencies
--   - Example: section details are in 'sections' table,
--              not inside the 'enrollments' table
-- ================================================================


-- ================================================================
-- LESSON 3: TABLE CREATION WITH CONSTRAINTS
-- ================================================================
-- CONSTRAINTS enforce Business Rules directly in the database.
--
--   PRIMARY KEY  -> uniquely identifies each row
--   NOT NULL     -> field cannot be empty
--   UNIQUE       -> no duplicate values allowed
--   CHECK        -> value must meet a condition
--   DEFAULT      -> fallback value if none is provided
--   FOREIGN KEY  -> links two tables together
-- ================================================================


-- TABLE 1: schools
-- 3NF: School details stored once, referenced by students and teachers.
CREATE TABLE schools (
    school_id    INT          PRIMARY KEY AUTO_INCREMENT,
    school_name  VARCHAR(150) NOT NULL,
    region       VARCHAR(50)  NOT NULL DEFAULT 'Region V',
    division     VARCHAR(100) NOT NULL DEFAULT 'Division of Sorsogon',
    district     VARCHAR(100) NOT NULL DEFAULT 'Bulan North District',
    address      VARCHAR(255)
);


-- TABLE 2: school_years
-- 3NF: School year stored once, used by sections and enrollments.
CREATE TABLE school_years (
    sy_id    INT         PRIMARY KEY AUTO_INCREMENT,
    sy_label VARCHAR(20) NOT NULL UNIQUE,
    sy_start DATE,
    sy_end   DATE
);


-- TABLE 3: teachers
-- 3NF: Teacher info stored once; sections reference teacher via FK.
CREATE TABLE teachers (
    teacher_id  INT          PRIMARY KEY AUTO_INCREMENT,
    school_id   INT          NOT NULL,
    full_name   VARCHAR(150) NOT NULL,
    POSITION    VARCHAR(100),
    ROLE        VARCHAR(20)  NOT NULL DEFAULT 'adviser'
                             CHECK (ROLE IN ('adviser', 'principal', 'both')),
    FOREIGN KEY (school_id) REFERENCES schools(school_id)
);


-- TABLE 4: sections
-- 2NF: Section details are separate from enrollments.
CREATE TABLE sections (
    section_id   INT         PRIMARY KEY AUTO_INCREMENT,
    school_id    INT         NOT NULL,
    sy_id        INT         NOT NULL,
    grade_level  TINYINT     NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
    section_name VARCHAR(50) NOT NULL,
    adviser_id   INT,
    FOREIGN KEY (school_id)  REFERENCES schools(school_id),
    FOREIGN KEY (sy_id)      REFERENCES school_years(sy_id),
    FOREIGN KEY (adviser_id) REFERENCES teachers(teacher_id)
);


-- TABLE 5: students
-- 3NF: Student personal info only. No grades or section data here.
CREATE TABLE students (
    student_id     INT         PRIMARY KEY AUTO_INCREMENT,
    lrn            CHAR(12)    NOT NULL UNIQUE,
    last_name      VARCHAR(80) NOT NULL,
    first_name     VARCHAR(80) NOT NULL,
    middle_initial CHAR(2),
    sex            VARCHAR(10) NOT NULL CHECK (sex IN ('Male', 'Female')),
    birth_date     DATE,
    school_id      INT         NOT NULL,
    FOREIGN KEY (school_id) REFERENCES schools(school_id)
);


-- TABLE 6: enrollments
-- Junction table linking students to sections per school year.
-- Operational Rule: a student cannot enroll twice in the same SY.
CREATE TABLE enrollments (
    enrollment_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    student_id    INT NOT NULL,
    section_id    INT NOT NULL,
    sy_id         INT NOT NULL,
    UNIQUE (student_id, sy_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    FOREIGN KEY (sy_id)      REFERENCES school_years(sy_id)
);


-- TABLE 7: learning_areas
-- 3NF: Subject names stored once; parent_area_id used for MAPEH sub-subjects.
CREATE TABLE learning_areas (
    area_id        INT          PRIMARY KEY AUTO_INCREMENT,
    area_code      VARCHAR(20)  NOT NULL UNIQUE,
    area_name      VARCHAR(100) NOT NULL,
    parent_area_id INT          DEFAULT NULL,
    sort_order     TINYINT      DEFAULT 0,
    FOREIGN KEY (parent_area_id) REFERENCES learning_areas(area_id)
);


-- TABLE 8: grades
-- Stores quarterly grades per student per subject.
-- Derivation Rules: final_grade and remarks are auto-computed columns.
-- Integrity Rule: grade values must be between 0 and 100.
CREATE TABLE grades (
    grade_id      INT          PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT          NOT NULL,
    area_id       INT          NOT NULL,
    q1            DECIMAL(5,2) CHECK (q1 BETWEEN 0 AND 100),
    q2            DECIMAL(5,2) CHECK (q2 BETWEEN 0 AND 100),
    q3            DECIMAL(5,2) CHECK (q3 BETWEEN 0 AND 100),
    q4            DECIMAL(5,2) CHECK (q4 BETWEEN 0 AND 100),
    -- Derivation Rule: final_grade = average of all four quarters
    final_grade   DECIMAL(5,2) GENERATED ALWAYS AS (
                      ROUND((COALESCE(q1,0) + COALESCE(q2,0) + COALESCE(q3,0) + COALESCE(q4,0)) / 4, 2)
                  ) STORED,
    -- Derivation Rule: Passed if final_grade >= 75, else Failed
    remarks       VARCHAR(10)  GENERATED ALWAYS AS (
                      IF(ROUND((COALESCE(q1,0)+COALESCE(q2,0)+COALESCE(q3,0)+COALESCE(q4,0))/4, 2) >= 75,
                         'Passed', 'Failed')
                  ) STORED,
    UNIQUE (enrollment_id, area_id),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id),
    FOREIGN KEY (area_id)       REFERENCES learning_areas(area_id)
);


-- TABLE 9: core_values
CREATE TABLE core_values (
    cv_id      INT         PRIMARY KEY AUTO_INCREMENT,
    cv_name    VARCHAR(80) NOT NULL,
    sort_order TINYINT     DEFAULT 0
);


-- TABLE 10: behavior_statements
CREATE TABLE behavior_statements (
    bs_id          INT          PRIMARY KEY AUTO_INCREMENT,
    cv_id          INT          NOT NULL,
    statement_text VARCHAR(255) NOT NULL,
    sort_order     TINYINT      DEFAULT 0,
    FOREIGN KEY (cv_id) REFERENCES core_values(cv_id)
);


-- TABLE 11: observed_values
-- Integrity Rule: rating must only be AO, SO, RO, or NO.
CREATE TABLE observed_values (
    ov_id         INT        PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT        NOT NULL,
    bs_id         INT        NOT NULL,
    q1            VARCHAR(2) CHECK (q1 IN ('AO','SO','RO','NO')),
    q2            VARCHAR(2) CHECK (q2 IN ('AO','SO','RO','NO')),
    q3            VARCHAR(2) CHECK (q3 IN ('AO','SO','RO','NO')),
    q4            VARCHAR(2) CHECK (q4 IN ('AO','SO','RO','NO')),
    UNIQUE (enrollment_id, bs_id),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id),
    FOREIGN KEY (bs_id)         REFERENCES behavior_statements(bs_id)
);


-- TABLE 12: attendance
CREATE TABLE attendance (
    att_id        INT              PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT              NOT NULL UNIQUE,
    jun_school    TINYINT UNSIGNED DEFAULT 0, jun_present TINYINT UNSIGNED DEFAULT 0,
    jul_school    TINYINT UNSIGNED DEFAULT 0, jul_present TINYINT UNSIGNED DEFAULT 0,
    aug_school    TINYINT UNSIGNED DEFAULT 0, aug_present TINYINT UNSIGNED DEFAULT 0,
    sep_school    TINYINT UNSIGNED DEFAULT 0, sep_present TINYINT UNSIGNED DEFAULT 0,
    oct_school    TINYINT UNSIGNED DEFAULT 0, oct_present TINYINT UNSIGNED DEFAULT 0,
    nov_school    TINYINT UNSIGNED DEFAULT 0, nov_present TINYINT UNSIGNED DEFAULT 0,
    dec_school    TINYINT UNSIGNED DEFAULT 0, dec_present TINYINT UNSIGNED DEFAULT 0,
    jan_school    TINYINT UNSIGNED DEFAULT 0, jan_present TINYINT UNSIGNED DEFAULT 0,
    feb_school    TINYINT UNSIGNED DEFAULT 0, feb_present TINYINT UNSIGNED DEFAULT 0,
    mar_school    TINYINT UNSIGNED DEFAULT 0, mar_present TINYINT UNSIGNED DEFAULT 0,
    apr_school    TINYINT UNSIGNED DEFAULT 0, apr_present TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
);