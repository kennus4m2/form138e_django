-- ================================================================
--  COMPLETE SEED DATA — M. A. Roxas Elementary School
--  Grade 1  |  SY 2025-2026  |  21 Students (Male:10, Female:11)
--
--  School days per month (DepEd SY 2025-2026):
--    Jun=19  Jul=22  Aug=21  Sep=20  Oct=23
--    Nov=19  Dec=15  Jan=22  Feb=20  Mar=22  Apr=8
--    TOTAL = 211 school days
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE attendance;
TRUNCATE TABLE observed_values;
TRUNCATE TABLE grades;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE students;
TRUNCATE TABLE sections;
TRUNCATE TABLE teachers;
TRUNCATE TABLE school_years;
TRUNCATE TABLE schools;
TRUNCATE TABLE behavior_statements;
TRUNCATE TABLE core_values;
TRUNCATE TABLE learning_areas;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 1. SCHOOL ─────────────────────────────────────────────────
INSERT INTO schools (school_name, region, division, district, address) VALUES
('M. A. Roxas Elementary School','Region V','Division of Sorsogon',
 'Bulan North District','M. Roxas, Bulan, Sorsogon');

-- ── 2. SCHOOL YEAR ────────────────────────────────────────────
INSERT INTO school_years (sy_label, sy_start, sy_end) VALUES
('2025-2026','2025-06-02','2026-04-03');

-- ── 3. TEACHERS ───────────────────────────────────────────────
INSERT INTO teachers (school_id, full_name, POSITION, ROLE) VALUES
(1,'GINALYN GODALLE POLO','Teacher I','adviser'),
(1,'MARY GRACE LIZANO GUSTUIR','Principal I','principal');

-- ── 4. SECTION ────────────────────────────────────────────────
INSERT INTO sections (school_id, sy_id, grade_level, section_name, adviser_id) VALUES
(1,1,1,'GREEN',1);

-- ── 5. LEARNING AREAS ─────────────────────────────────────────
INSERT INTO learning_areas (area_code,area_name,parent_area_id,sort_order) VALUES
('FIL',  'Filipino',                                        NULL, 1),
('ENG',  'English',                                         NULL, 2),
('MATH', 'Mathematics',                                     NULL, 3),
('SCI',  'Science',                                         NULL, 4),
('AP',   'Araling Panlipunan (AP)',                         NULL, 5),
('ESP',  'Edukasyon sa Pagpapakatao (EsP)',                 NULL, 6),
('EPP',  'Edukasyong Pantahanan at Pangkabuhayan (EPP)',    NULL, 7),
('MAPEH','MAPEH',                                           NULL, 8),
('MUS',  '- Music',                                         8,   9),
('ARTS', '- Arts',                                          8,  10),
('PE',   '- Physical Education',                            8,  11),
('HLT',  '- Health',                                        8,  12);

-- ── 6. CORE VALUES & BEHAVIOR STATEMENTS ──────────────────────
INSERT INTO core_values (cv_name,sort_order) VALUES
('1. Maka-Diyos',1),('2. Makatao',2),
('3. Makakalikasan',3),('4. Makabansa',4);

INSERT INTO behavior_statements (cv_id,statement_text,sort_order) VALUES
(1,'Expresses spiritual beliefs while respecting others.',1),
(1,'Shows adherence to ethical principles by upholding truth.',2),
(2,'Is sensitive to individual, social, and cultural differences.',1),
(2,'Demonstrates contributions toward solidarity.',2),
(3,'Cares for the environment and utilizes resources wisely.',1),
(4,'Demonstrates pride in being a Filipino citizen.',1),
(4,'Shows appropriate behavior in school and community.',2);

-- ── 7. STUDENTS ───────────────────────────────────────────────
INSERT INTO students (lrn,last_name,first_name,middle_initial,sex,birth_date,school_id) VALUES
('136642230198','Galorport','Andie',         'F','Male',  '2017-10-17',1),
('114018240001','Gentolia', 'RJ',            'C','Male',  '2019-07-09',1),
('114018240002','Gipa',     'Jommel',        'M','Male',  '2019-02-10',1),
('114018240003','Gito',     'Blue Gavin',    'J','Male',  '2019-02-08',1),
('501495240042','Gregorio', 'Ricel',         'D','Male',  '2018-05-09',1),
('114018240004','Hona',     'Xander Matte',  'G','Male',  '2019-09-22',1),
('114018240005','Llacer',   'Kyril',         'G','Male',  '2019-03-04',1),
('114015240069','Somontan', 'Xian David',    'G','Male',  '2019-02-04',1),
('114018240006','Tan',      'Xian Carl',     'G','Male',  '2019-01-09',1),
('114018240007','Valentin', 'Rencil',        'G','Male',  '2019-09-23',1),
('114018240008','Botalon',  'Rhudy-Lyn',     'G','Female','2019-03-06',1),
('114018240009','Buere',    'Arahbella',     'E','Female','2019-06-19',1),
('114018240010','Gepolle',  'Mia',           'L','Female','2019-05-13',1),
('114018240011','Gestiada', 'Christine',     'G','Female','2018-12-02',1),
('114024240011','Golpo',    'Erich',         'S','Female','2019-05-18',1),
('114018240014','Ludovice', 'Czarina Yhonna','G','Female','2019-02-16',1),
('114018240012','Mantes',   'Britneylyn',    'M','Female','2019-08-13',1),
('114018230027','Mejera',   'Judy Ann',      'S','Female','2018-09-19',1),
('114018240013','Merana',   'Eliza Jean',    'B','Female','2019-01-03',1),
('114018240015','Rapada',   'Yassie',        'M','Female','2019-07-29',1),
('114018240016','Tambal',   'Arian',         'B','Female','2018-12-12',1);

-- ── 8. ENROLLMENTS ────────────────────────────────────────────
INSERT INTO enrollments (student_id,section_id,sy_id) VALUES
(1,1,1),(2,1,1),(3,1,1),(4,1,1),(5,1,1),(6,1,1),(7,1,1),
(8,1,1),(9,1,1),(10,1,1),(11,1,1),(12,1,1),(13,1,1),(14,1,1),
(15,1,1),(16,1,1),(17,1,1),(18,1,1),(19,1,1),(20,1,1),(21,1,1);

-- ── 9. GRADES ─────────────────────────────────────────────────
-- area_id: 1=FIL 2=ENG 3=MATH 4=SCI 5=AP 6=ESP 7=EPP
--          8=MAPEH 9=MUS 10=ARTS 11=PE 12=HLT
-- Grades trend upward Q1→Q4 (normal Grade 1 progression)

-- 1. Galorport — Outstanding
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(1,1,90,92,94,95),(1,2,88,91,93,94),(1,3,91,93,95,96),
(1,4,89,91,93,95),(1,5,90,92,94,95),(1,6,92,93,95,96),
(1,7,90,92,93,95),(1,8,90,92,94,95),(1,9,90,91,93,94),
(1,10,91,93,95,96),(1,11,89,91,93,95),(1,12,90,92,94,95);

-- 2. Gentolia — Very Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(2,1,85,87,89,91),(2,2,83,85,88,90),(2,3,84,86,88,90),
(2,4,85,87,89,90),(2,5,86,88,90,91),(2,6,87,89,90,92),
(2,7,85,87,89,90),(2,8,85,87,89,90),(2,9,84,86,88,89),
(2,10,86,88,90,91),(2,11,85,87,89,90),(2,12,85,87,89,90);

-- 3. Gipa — Fairly Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(3,1,75,76,78,80),(3,2,75,76,77,79),(3,3,75,77,78,80),
(3,4,76,77,79,80),(3,5,75,77,78,80),(3,6,77,78,80,82),
(3,7,75,76,78,80),(3,8,76,77,79,81),(3,9,75,76,78,80),
(3,10,77,78,80,82),(3,11,75,77,79,81),(3,12,76,77,79,81);

-- 4. Gito — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(4,1,80,82,84,86),(4,2,79,81,83,85),(4,3,80,82,84,86),
(4,4,80,82,84,85),(4,5,81,83,85,86),(4,6,82,84,85,87),
(4,7,80,82,84,85),(4,8,81,82,84,86),(4,9,80,81,83,85),
(4,10,82,83,85,87),(4,11,80,82,84,86),(4,12,81,82,84,86);

-- 5. Gregorio — Very Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(5,1,86,88,90,92),(5,2,84,86,89,91),(5,3,87,89,91,92),
(5,4,85,87,89,91),(5,5,86,88,90,92),(5,6,88,90,91,93),
(5,7,85,87,89,91),(5,8,86,88,90,92),(5,9,85,87,89,91),
(5,10,87,89,91,93),(5,11,85,87,89,91),(5,12,86,88,90,92);

-- 6. Hona — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(6,1,79,81,83,85),(6,2,78,80,82,84),(6,3,79,81,83,85),
(6,4,79,81,83,85),(6,5,80,82,84,86),(6,6,81,83,85,86),
(6,7,79,81,83,85),(6,8,80,82,84,86),(6,9,79,81,83,85),
(6,10,81,83,85,86),(6,11,79,81,83,85),(6,12,80,82,84,86);

-- 7. Llacer — Outstanding
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(7,1,89,91,93,95),(7,2,87,90,92,94),(7,3,90,92,94,96),
(7,4,88,91,93,95),(7,5,89,91,93,95),(7,6,91,93,94,96),
(7,7,89,91,93,95),(7,8,89,91,93,95),(7,9,88,90,92,94),
(7,10,90,92,94,96),(7,11,88,91,93,95),(7,12,89,91,93,95);

-- 8. Somontan — Fairly Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(8,1,75,77,79,81),(8,2,75,76,78,80),(8,3,76,77,79,81),
(8,4,75,77,78,80),(8,5,76,77,79,81),(8,6,77,79,80,82),
(8,7,75,77,79,80),(8,8,76,77,79,81),(8,9,75,76,78,80),
(8,10,77,78,80,82),(8,11,75,77,79,81),(8,12,76,77,79,81);

-- 9. Tan — Very Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(9,1,84,86,88,91),(9,2,83,85,87,90),(9,3,85,87,89,91),
(9,4,84,86,88,90),(9,5,84,86,88,91),(9,6,86,88,90,92),
(9,7,84,86,88,90),(9,8,85,87,89,91),(9,9,84,86,88,90),
(9,10,86,88,90,92),(9,11,84,86,88,90),(9,12,85,87,89,91);

-- 10. Valentin — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(10,1,78,80,82,85),(10,2,77,79,81,84),(10,3,78,80,82,84),
(10,4,78,80,82,84),(10,5,79,81,83,85),(10,6,80,82,84,86),
(10,7,78,80,82,84),(10,8,79,81,83,85),(10,9,78,80,82,84),
(10,10,80,82,84,86),(10,11,78,80,82,84),(10,12,79,81,83,85);

-- 11. Botalon — Outstanding
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(11,1,91,93,95,97),(11,2,89,92,94,96),(11,3,92,94,96,97),
(11,4,90,92,94,96),(11,5,91,93,95,97),(11,6,93,95,96,98),
(11,7,91,93,95,96),(11,8,91,93,95,97),(11,9,90,92,94,96),
(11,10,92,94,96,97),(11,11,90,92,94,96),(11,12,91,93,95,97);

-- 12. Buere — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(12,1,80,82,84,87),(12,2,79,81,83,86),(12,3,80,82,84,87),
(12,4,80,82,84,86),(12,5,81,83,85,87),(12,6,82,84,86,88),
(12,7,80,82,84,86),(12,8,81,83,85,87),(12,9,80,82,84,86),
(12,10,82,84,86,88),(12,11,80,82,84,86),(12,12,81,83,85,87);

-- 13. Gepolle — Very Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(13,1,85,87,90,92),(13,2,84,86,89,91),(13,3,86,88,90,92),
(13,4,85,87,89,92),(13,5,85,87,90,92),(13,6,87,89,91,93),
(13,7,85,87,89,91),(13,8,86,88,90,92),(13,9,85,87,89,91),
(13,10,87,89,91,93),(13,11,85,87,89,91),(13,12,86,88,90,92);

-- 14. Gestiada — Outstanding
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(14,1,92,94,96,97),(14,2,90,93,95,97),(14,3,93,95,96,98),
(14,4,91,93,95,97),(14,5,92,94,96,97),(14,6,94,95,97,98),
(14,7,91,93,95,97),(14,8,92,94,96,97),(14,9,91,93,95,96),
(14,10,93,95,97,98),(14,11,91,93,95,97),(14,12,92,94,96,97);

-- 15. Golpo — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(15,1,80,82,84,86),(15,2,79,81,83,85),(15,3,80,82,84,87),
(15,4,79,81,83,86),(15,5,80,82,85,86),(15,6,82,84,86,87),
(15,7,80,82,84,86),(15,8,81,83,85,87),(15,9,80,82,84,86),
(15,10,82,84,86,88),(15,11,80,82,84,86),(15,12,81,83,85,87);

-- 16. Ludovice — Outstanding
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(16,1,89,92,94,96),(16,2,88,90,93,95),(16,3,90,92,94,96),
(16,4,88,91,93,95),(16,5,89,92,94,96),(16,6,91,93,95,96),
(16,7,89,91,93,95),(16,8,90,92,94,96),(16,9,89,91,93,95),
(16,10,91,93,95,96),(16,11,88,91,93,95),(16,12,90,92,94,96);

-- 17. Mantes — Very Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(17,1,83,85,88,91),(17,2,82,84,87,89),(17,3,84,86,88,91),
(17,4,83,85,87,90),(17,5,83,86,88,91),(17,6,85,87,89,92),
(17,7,83,85,87,90),(17,8,84,86,88,91),(17,9,83,85,87,90),
(17,10,85,87,89,92),(17,11,83,85,87,90),(17,12,84,86,88,91);

-- 18. Mejera — Fairly Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(18,1,75,76,78,80),(18,2,75,75,77,79),(18,3,75,76,78,80),
(18,4,75,76,78,79),(18,5,76,77,79,81),(18,6,77,78,80,82),
(18,7,75,76,78,80),(18,8,76,77,79,81),(18,9,75,76,78,80),
(18,10,77,78,80,82),(18,11,75,76,78,80),(18,12,76,77,79,81);

-- 19. Merana — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(19,1,79,81,84,86),(19,2,78,80,82,85),(19,3,79,81,84,86),
(19,4,79,81,83,85),(19,5,80,82,84,86),(19,6,81,83,85,87),
(19,7,79,81,83,85),(19,8,80,82,84,86),(19,9,79,81,83,85),
(19,10,81,83,85,87),(19,11,79,81,83,85),(19,12,80,82,84,86);

-- 20. Rapada — Very Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(20,1,84,87,89,92),(20,2,83,86,88,91),(20,3,85,87,89,92),
(20,4,84,86,88,91),(20,5,84,87,89,92),(20,6,86,88,90,93),
(20,7,84,86,88,91),(20,8,85,87,89,92),(20,9,84,86,88,91),
(20,10,86,88,90,93),(20,11,84,86,88,91),(20,12,85,87,89,92);

-- 21. Tambal — Satisfactory
INSERT INTO grades(enrollment_id,area_id,q1,q2,q3,q4) VALUES
(21,1,78,80,83,85),(21,2,77,79,81,84),(21,3,78,80,83,85),
(21,4,78,80,82,84),(21,5,79,81,83,85),(21,6,80,82,84,86),
(21,7,78,80,82,85),(21,8,79,81,83,86),(21,9,78,80,82,84),
(21,10,80,82,84,86),(21,11,78,80,82,84),(21,12,79,81,83,85);


-- ── 10. OBSERVED VALUES ───────────────────────────────────────
INSERT INTO observed_values(enrollment_id,bs_id,q1,q2,q3,q4) VALUES
(1,1,'AO','AO','AO','AO'),(1,2,'AO','AO','AO','AO'),(1,3,'AO','AO','AO','AO'),
(1,4,'AO','AO','AO','AO'),(1,5,'AO','AO','AO','AO'),(1,6,'AO','AO','AO','AO'),(1,7,'AO','AO','AO','AO'),
(2,1,'SO','SO','AO','AO'),(2,2,'SO','SO','AO','AO'),(2,3,'SO','AO','AO','AO'),
(2,4,'SO','AO','AO','AO'),(2,5,'SO','SO','AO','AO'),(2,6,'SO','AO','AO','AO'),(2,7,'SO','AO','AO','AO'),
(3,1,'SO','SO','SO','AO'),(3,2,'RO','SO','SO','AO'),(3,3,'SO','SO','SO','AO'),
(3,4,'SO','SO','SO','AO'),(3,5,'SO','SO','SO','AO'),(3,6,'SO','SO','AO','AO'),(3,7,'RO','SO','SO','AO'),
(4,1,'SO','SO','AO','AO'),(4,2,'SO','SO','AO','AO'),(4,3,'SO','SO','AO','AO'),
(4,4,'SO','SO','AO','AO'),(4,5,'SO','SO','AO','AO'),(4,6,'SO','AO','AO','AO'),(4,7,'SO','SO','AO','AO'),
(5,1,'SO','AO','AO','AO'),(5,2,'SO','AO','AO','AO'),(5,3,'SO','AO','AO','AO'),
(5,4,'SO','AO','AO','AO'),(5,5,'SO','AO','AO','AO'),(5,6,'AO','AO','AO','AO'),(5,7,'SO','AO','AO','AO'),
(6,1,'SO','SO','SO','AO'),(6,2,'SO','SO','SO','AO'),(6,3,'SO','SO','AO','AO'),
(6,4,'SO','SO','AO','AO'),(6,5,'SO','SO','AO','AO'),(6,6,'SO','SO','AO','AO'),(6,7,'SO','SO','AO','AO'),
(7,1,'AO','AO','AO','AO'),(7,2,'AO','AO','AO','AO'),(7,3,'AO','AO','AO','AO'),
(7,4,'AO','AO','AO','AO'),(7,5,'AO','AO','AO','AO'),(7,6,'AO','AO','AO','AO'),(7,7,'AO','AO','AO','AO'),
(8,1,'RO','SO','SO','AO'),(8,2,'SO','SO','SO','AO'),(8,3,'SO','SO','SO','AO'),
(8,4,'SO','SO','SO','AO'),(8,5,'SO','SO','SO','AO'),(8,6,'SO','SO','AO','AO'),(8,7,'RO','SO','SO','AO'),
(9,1,'SO','AO','AO','AO'),(9,2,'SO','AO','AO','AO'),(9,3,'SO','AO','AO','AO'),
(9,4,'SO','AO','AO','AO'),(9,5,'SO','AO','AO','AO'),(9,6,'AO','AO','AO','AO'),(9,7,'SO','AO','AO','AO'),
(10,1,'SO','SO','AO','AO'),(10,2,'SO','SO','AO','AO'),(10,3,'SO','SO','AO','AO'),
(10,4,'SO','SO','AO','AO'),(10,5,'SO','SO','AO','AO'),(10,6,'SO','AO','AO','AO'),(10,7,'SO','SO','AO','AO'),
(11,1,'AO','AO','AO','AO'),(11,2,'AO','AO','AO','AO'),(11,3,'AO','AO','AO','AO'),
(11,4,'AO','AO','AO','AO'),(11,5,'AO','AO','AO','AO'),(11,6,'AO','AO','AO','AO'),(11,7,'AO','AO','AO','AO'),
(12,1,'SO','SO','AO','AO'),(12,2,'SO','SO','AO','AO'),(12,3,'SO','SO','AO','AO'),
(12,4,'SO','SO','AO','AO'),(12,5,'SO','SO','AO','AO'),(12,6,'SO','AO','AO','AO'),(12,7,'SO','SO','AO','AO'),
(13,1,'SO','AO','AO','AO'),(13,2,'SO','AO','AO','AO'),(13,3,'SO','AO','AO','AO'),
(13,4,'SO','AO','AO','AO'),(13,5,'SO','AO','AO','AO'),(13,6,'AO','AO','AO','AO'),(13,7,'SO','AO','AO','AO'),
(14,1,'AO','AO','AO','AO'),(14,2,'AO','AO','AO','AO'),(14,3,'AO','AO','AO','AO'),
(14,4,'AO','AO','AO','AO'),(14,5,'AO','AO','AO','AO'),(14,6,'AO','AO','AO','AO'),(14,7,'AO','AO','AO','AO'),
(15,1,'SO','SO','AO','AO'),(15,2,'SO','SO','AO','AO'),(15,3,'SO','SO','AO','AO'),
(15,4,'SO','SO','AO','AO'),(15,5,'SO','SO','AO','AO'),(15,6,'SO','AO','AO','AO'),(15,7,'SO','SO','AO','AO'),
(16,1,'AO','AO','AO','AO'),(16,2,'AO','AO','AO','AO'),(16,3,'AO','AO','AO','AO'),
(16,4,'AO','AO','AO','AO'),(16,5,'AO','AO','AO','AO'),(16,6,'AO','AO','AO','AO'),(16,7,'AO','AO','AO','AO'),
(17,1,'SO','SO','AO','AO'),(17,2,'SO','SO','AO','AO'),(17,3,'SO','AO','AO','AO'),
(17,4,'SO','AO','AO','AO'),(17,5,'SO','AO','AO','AO'),(17,6,'SO','AO','AO','AO'),(17,7,'SO','SO','AO','AO'),
(18,1,'SO','SO','SO','AO'),(18,2,'RO','SO','SO','AO'),(18,3,'SO','SO','SO','AO'),
(18,4,'SO','SO','SO','AO'),(18,5,'SO','SO','AO','AO'),(18,6,'SO','SO','AO','AO'),(18,7,'RO','SO','SO','AO'),
(19,1,'SO','SO','AO','AO'),(19,2,'SO','SO','AO','AO'),(19,3,'SO','SO','AO','AO'),
(19,4,'SO','SO','AO','AO'),(19,5,'SO','AO','AO','AO'),(19,6,'SO','AO','AO','AO'),(19,7,'SO','SO','AO','AO'),
(20,1,'SO','AO','AO','AO'),(20,2,'SO','AO','AO','AO'),(20,3,'SO','AO','AO','AO'),
(20,4,'SO','AO','AO','AO'),(20,5,'AO','AO','AO','AO'),(20,6,'AO','AO','AO','AO'),(20,7,'SO','AO','AO','AO'),
(21,1,'SO','SO','AO','AO'),(21,2,'SO','SO','AO','AO'),(21,3,'SO','SO','AO','AO'),
(21,4,'SO','SO','AO','AO'),(21,5,'SO','SO','AO','AO'),(21,6,'SO','AO','AO','AO'),(21,7,'SO','SO','AO','AO');


-- ── 11. ATTENDANCE ────────────────────────────────────────────
-- School days per month (SY 2025-2026):
-- Jun=19 Jul=22 Aug=21 Sep=20 Oct=23 Nov=19 Dec=15 Jan=22 Feb=20 Mar=22 Apr=8
-- Total school days = 211
--
-- Columns: jun_school,jun_present, jul_school,jul_present,
--          aug_school,aug_present, sep_school,sep_present,
--          oct_school,oct_present, nov_school,nov_present,
--          dec_school,dec_present, jan_school,jan_present,
--          feb_school,feb_present, mar_school,mar_present,
--          apr_school,apr_present
INSERT INTO attendance
(enrollment_id,
 jun_school,jun_present,jul_school,jul_present,aug_school,aug_present,
 sep_school,sep_present,oct_school,oct_present,nov_school,nov_present,
 dec_school,dec_present,jan_school,jan_present,feb_school,feb_present,
 mar_school,mar_present,apr_school,apr_present)
VALUES
--  enr  Jun       Jul       Aug       Sep       Oct       Nov       Dec       Jan       Feb       Mar       Apr
-- 1. Galorport — very good (total absent: 4)
(1,  19,18,  22,22,  21,21,  20,20,  23,23,  19,19,  15,15,  22,22,  20,20,  22,21,  8,8),
-- 2. Gentolia — near perfect (total absent: 2)
(2,  19,19,  22,22,  21,21,  20,20,  23,22,  19,19,  15,15,  22,22,  20,20,  22,22,  8,8),
-- 3. Gipa — higher absences (total absent: 22)
(3,  19,17,  22,20,  21,19,  20,18,  23,21,  19,17,  15,14,  22,20,  20,18,  22,20,  8,7),
-- 4. Gito — average (total absent: 9)
(4,  19,18,  22,21,  21,20,  20,19,  23,22,  19,18,  15,15,  22,21,  20,19,  22,21,  8,8),
-- 5. Gregorio — very good (total absent: 3)
(5,  19,19,  22,22,  21,21,  20,20,  23,23,  19,18,  15,15,  22,22,  20,20,  22,22,  8,8),
-- 6. Hona — average (total absent: 10)
(6,  19,18,  22,21,  21,20,  20,19,  23,22,  19,18,  15,14,  22,21,  20,19,  22,21,  8,7),
-- 7. Llacer — perfect (total absent: 0)
(7,  19,19,  22,22,  21,21,  20,20,  23,23,  19,19,  15,15,  22,22,  20,20,  22,22,  8,8),
-- 8. Somontan — higher absences (total absent: 23)
(8,  19,17,  22,20,  21,19,  20,18,  23,21,  19,17,  15,13,  22,20,  20,18,  22,20,  8,7),
-- 9. Tan — very good (total absent: 3)
(9,  19,19,  22,22,  21,21,  20,20,  23,22,  19,19,  15,15,  22,22,  20,20,  22,21,  8,8),
-- 10. Valentin — average (total absent: 8)
(10, 19,18,  22,21,  21,20,  20,19,  23,22,  19,18,  15,15,  22,21,  20,19,  22,21,  8,8),
-- 11. Botalon — perfect (total absent: 0)
(11, 19,19,  22,22,  21,21,  20,20,  23,23,  19,19,  15,15,  22,22,  20,20,  22,22,  8,8),
-- 12. Buere — average (total absent: 9)
(12, 19,18,  22,21,  21,20,  20,19,  23,22,  19,18,  15,15,  22,21,  20,19,  22,21,  8,8),
-- 13. Gepolle — very good (total absent: 4)
(13, 19,19,  22,22,  21,21,  20,20,  23,23,  19,18,  15,15,  22,22,  20,20,  22,21,  8,8),
-- 14. Gestiada — perfect (total absent: 0)
(14, 19,19,  22,22,  21,21,  20,20,  23,23,  19,19,  15,15,  22,22,  20,20,  22,22,  8,8),
-- 15. Golpo — average (total absent: 10)
(15, 19,18,  22,21,  21,20,  20,19,  23,22,  19,18,  15,14,  22,21,  20,19,  22,21,  8,8),
-- 16. Ludovice — near perfect (total absent: 1)
(16, 19,19,  22,22,  21,21,  20,20,  23,23,  19,19,  15,15,  22,22,  20,20,  22,22,  8,7),
-- 17. Mantes — very good (total absent: 4)
(17, 19,19,  22,21,  21,21,  20,20,  23,22,  19,19,  15,15,  22,21,  20,20,  22,22,  8,8),
-- 18. Mejera — higher absences (total absent: 24)
(18, 19,16,  22,20,  21,19,  20,18,  23,21,  19,17,  15,13,  22,20,  20,18,  22,20,  8,7),
-- 19. Merana — average (total absent: 7)
(19, 19,18,  22,21,  21,20,  20,20,  23,22,  19,18,  15,15,  22,21,  20,19,  22,21,  8,8),
-- 20. Rapada — very good (total absent: 4)
(20, 19,19,  22,22,  21,21,  20,20,  23,22,  19,19,  15,15,  22,22,  20,20,  22,21,  8,8),
-- 21. Tambal — average (total absent: 9)
(21, 19,18,  22,21,  21,20,  20,19,  23,22,  19,18,  15,15,  22,21,  20,19,  22,21,  8,8);