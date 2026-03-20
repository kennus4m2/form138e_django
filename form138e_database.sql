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


-- ================================================================
-- SEED DATA
-- ================================================================

INSERT INTO schools (school_name, region, division, district, address) VALUES
('M.A. Roxas Elementary School', 'Region V', 'Division of Sorsogon', 'Bulan North District', 'Inararan, Bulan, Sorsogon');

INSERT INTO school_years (sy_label, sy_start, sy_end) VALUES
('2016-2017', '2016-06-06', '2017-04-07'),
('2017-2018', '2017-06-05', '2018-04-06');

INSERT INTO teachers (school_id, full_name, POSITION, ROLE) VALUES
(1, 'JERSON C. ABEJUELA',  'ESHT 3', 'adviser'),
(1, 'LUCIEN S. SOMALINOG', 'ESHT 3', 'principal');

INSERT INTO sections (school_id, sy_id, grade_level, section_name, adviser_id) VALUES
(1, 1, 5, 'One',   1),
(1, 1, 5, 'Two',   1),
(1, 1, 5, 'Three', 1);

INSERT INTO students (lrn, last_name, first_name, middle_initial, sex, birth_date, school_id) VALUES
('114014110013', 'Formento',  'Nickson', 'M', 'Male',   '2005-03-15', 1),
('114014110014', 'Santos',    'Maria',   'L', 'Female', '2005-07-22', 1),
('114014110015', 'Dela Cruz', 'Juan',    'P', 'Male',   '2004-11-30', 1);

INSERT INTO enrollments (student_id, section_id, sy_id) VALUES
(1, 1, 1), (2, 2, 1), (3, 3, 1);

INSERT INTO learning_areas (area_code, area_name, parent_area_id, sort_order) VALUES
('FIL',   'Filipino',                                        NULL, 1),
('ENG',   'English',                                         NULL, 2),
('MATH',  'Mathematics',                                     NULL, 3),
('SCI',   'Science',                                         NULL, 4),
('AP',    'Araling Panlipunan (AP)',                         NULL, 5),
('ESP',   'Edukasyon sa Pagpapakatao (EsP)',                 NULL, 6),
('EPP',   'Edukasyong Pantahanan at Pangkabuhayan (EPP)',    NULL, 7),
('MAPEH', 'MAPEH',                                           NULL, 8),
('MUS',   '- Music',                                         8,   9),
('ARTS',  '- Arts',                                          8,  10),
('PE',    '- Physical Education',                            8,  11),
('HLT',   '- Health',                                        8,  12);

INSERT INTO core_values (cv_name, sort_order) VALUES
('1. Maka-Diyos', 1), ('2. Makatao', 2),
('3. Makakalikasan', 3), ('4. Makabansa', 4);

INSERT INTO behavior_statements (cv_id, statement_text, sort_order) VALUES
(1, 'Expresses spiritual beliefs while respecting others.', 1),
(1, 'Shows adherence to ethical principles by upholding truth.', 2),
(2, 'Is sensitive to individual, social, and cultural differences.', 1),
(2, 'Demonstrates contributions toward solidarity.', 2),
(3, 'Cares for the environment and utilizes resources wisely.', 1),
(4, 'Demonstrates pride in being a Filipino citizen.', 1),
(4, 'Shows appropriate behavior in school and community.', 2);

-- Grades: Nickson Formento
INSERT INTO grades (enrollment_id, area_id, q1, q2, q3, q4) VALUES
(1,1,92,92,94,94),(1,2,86,88,92,95),(1,3,91,90,91,94),(1,4,92,90,94,95),
(1,5,88,84,94,95),(1,6,90,91,95,96),(1,7,89,91,94,96),(1,8,87,90,94,95),
(1,9,83,90,94,95),(1,10,87,90,98,96),(1,11,86,86,91,95),(1,12,90,93,94,95);

-- Grades: Maria Santos
INSERT INTO grades (enrollment_id, area_id, q1, q2, q3, q4) VALUES
(2,1,95,93,96,97),(2,2,90,91,93,94),(2,3,88,87,90,92),(2,4,91,90,93,95),
(2,5,90,89,92,94),(2,6,92,93,95,96),(2,7,90,91,93,95),(2,8,89,90,93,94),
(2,9,88,90,92,94),(2,10,90,91,94,96),(2,11,88,89,93,94),(2,12,91,90,93,93);

-- Grades: Juan Dela Cruz
INSERT INTO grades (enrollment_id, area_id, q1, q2, q3, q4) VALUES
(3,1,80,82,83,85),(3,2,76,78,80,82),(3,3,78,75,79,80),(3,4,80,81,82,84),
(3,5,82,83,85,86),(3,6,85,86,87,88),(3,7,80,81,83,85),(3,8,82,83,85,86),
(3,9,80,82,84,86),(3,10,83,84,86,87),(3,11,83,83,85,86),(3,12,82,83,85,85);

INSERT INTO observed_values (enrollment_id, bs_id, q1, q2, q3, q4) VALUES
(1,1,'SO','SO','AO','AO'),(1,2,'SO','SO','AO','AO'),(1,3,'SO','SO','AO','AO'),
(1,4,'SO','SO','AO','AO'),(1,5,'SO','SO','AO','AO'),(1,6,'SO','SO','AO','AO'),(1,7,'SO','SO','AO','AO'),
(2,1,'AO','AO','AO','AO'),(2,2,'AO','AO','AO','AO'),(2,3,'SO','AO','AO','AO'),
(2,4,'SO','AO','AO','AO'),(2,5,'SO','AO','AO','AO'),(2,6,'SO','AO','AO','AO'),(2,7,'AO','AO','AO','AO'),
(3,1,'SO','SO','SO','AO'),(3,2,'RO','SO','SO','AO'),(3,3,'SO','SO','AO','AO'),
(3,4,'SO','SO','AO','AO'),(3,5,'SO','SO','AO','AO'),(3,6,'SO','SO','SO','AO'),(3,7,'SO','SO','AO','AO');

INSERT INTO attendance (enrollment_id,
    jun_school,jun_present,jul_school,jul_present,aug_school,aug_present,
    sep_school,sep_present,oct_school,oct_present,nov_school,nov_present,
    dec_school,dec_present,jan_school,jan_present,feb_school,feb_present,
    mar_school,mar_present,apr_school,apr_present) VALUES
(1,14,14,20,20,20,20,21,21,25,25,21,21,20,20,23,23,5,5,20,20,0,0),
(2,14,14,20,20,20,19,21,21,25,24,21,21,20,20,23,23,5,5,20,20,0,0),
(3,14,13,20,19,20,20,21,20,25,24,21,20,20,19,23,22,5,5,20,19,0,0);