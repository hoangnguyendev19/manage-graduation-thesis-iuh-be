-- Major
INSERT INTO majors (name) VALUES ('Hệ thống thông tin');
INSERT INTO majors (name) VALUES ('Công nghệ thông tin');
INSERT INTO majors (name) VALUES ('Kỹ thuật phần mềm');
INSERT INTO majors (name) VALUES ('Khoa học máy tính');
INSERT INTO majors (name) VALUES ('Khoa học dữ liệu');

-- Term
INSERT INTO terms (name, start_date, end_date, start_choose_group, end_choose_group, start_choose_topic, end_choose_topic, start_discussion, end_discussion, start_report, end_report, start_public_result, end_public_result) VALUES ('HK1_2023-2024', '2023-09-01', '2024-01-01', '2023-09-01', '2024-10-01', '2023-10-02', '2023-10-15', '2023-10-16', '2023-11-15', '2023-11-16', '2023-12-01', '2024-12-02', '2024-01-01');
INSERT INTO terms (name, start_date, end_date, start_choose_group, end_choose_group, start_choose_topic, end_choose_topic, start_discussion, end_discussion, start_report, end_report, start_public_result, end_public_result) VALUES ('HK2_2023-2024', '2024-01-02', '2024-05-01', '2024-01-02', '2024-06-01', '2024-02-02', '2024-02-15', '2024-02-16', '2024-03-15', '2024-03-16', '2024-04-01', '2024-04-02', '2024-05-01');
INSERT INTO terms (name, start_date, end_date, start_choose_group, end_choose_group, start_choose_topic, end_choose_topic, start_discussion, end_discussion, start_report, end_report, start_public_result, end_public_result) VALUES ('HK3_2023-2024', '2024-05-02', '2024-09-01', '2024-05-02', '2024-10-01', '2024-06-02', '2024-06-15', '2024-06-16', '2024-07-15', '2024-07-16', '2024-08-01', '2024-08-02', '2024-09-01');
INSERT INTO terms (name, start_date, end_date, start_choose_group, end_choose_group, start_choose_topic, end_choose_topic, start_discussion, end_discussion, start_report, end_report, start_public_result, end_public_result) VALUES ('HK1_2024-2025', '2024-09-02', '2025-01-01', '2024-09-02', '2025-01-01', '2024-10-02', '2024-10-15', '2024-10-16', '2024-11-15', '2024-11-16', '2024-12-01', '2025-12-02', '2025-01-01');
INSERT INTO terms (name, start_date, end_date, start_choose_group, end_choose_group, start_choose_topic, end_choose_topic, start_discussion, end_discussion, start_report, end_report, start_public_result, end_public_result) VALUES ('HK2_2024-2025', '2025-01-02', '2025-05-01', '2025-01-02', '2025-06-01', '2025-02-02', '2025-02-15', '2025-02-16', '2025-03-15', '2025-03-16', '2025-04-01', '2025-04-02', '2025-05-01');
INSERT INTO terms (name, start_date, end_date, start_choose_group, end_choose_group, start_choose_topic, end_choose_topic, start_discussion, end_discussion, start_report, end_report, start_public_result, end_public_result) VALUES ('HK3_2024-2025', '2025-05-02', '2025-09-01', '2025-05-02', '2025-10-01', '2025-06-02', '2025-06-15', '2025-06-16', '2025-07-15', '2025-07-16', '2025-08-01', '2025-08-02', '2025-09-01');

-- Student 
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('21084321', '21084321', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Nguyễn Huy Hoàng', 'hoangnguyen@gmail.com', 'MALE', '0327194436', '2021-2025', 'UNIVERSITY', 3);
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('21092341', '21092341', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Nguyễn Minh Quang', 'quangnguyen@gmail.com', 'MALE', '0326104436', '2021-2025', 'UNIVERSITY', 3); 
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('21062341', '21062341', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Đỗ Chí Tường', 'tuongnguyen@gmail.com', 'MALE', '0326224436', '2021-2025', 'UNIVERSITY', 3);
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('21112142', '21112142', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Trần Thị Tường Vy', 'vynguyen@gmail.com', 'FEMALE', '0321124439', '2021-2025', 'UNIVERSITY', 1);
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('21232341', '21232341', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Trần Thị Yến Nhi', 'nhitran@gmail.com', 'FEMALE', '0321124430', '2021-2025', 'UNIVERSITY', 2);
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('20512341', '20052341', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Nguyễn Văn Tiến', 'tiennguyen@gmail.com', 'MALE', '0321124431', '2021-2025', 'UNIVERSITY', 4);
INSERT INTO students (id, username, password, full_name, email, gender, phone, school_year, type_training, major_id) VALUES ('21021234', '21021234', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Phạm Thị Hương', 'huongpham@gmail.com', 'FEMALE', '0321124446', '2021-2025', 'UNIVERSITY', 5);

-- Lecturer
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20018432', '20018432', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Nguyễn Thị Hạnh', 'hanhnguyen@gmail.com', '0304125678', 'FEMALE', 'DOCTOR', 'HEAD_LECTURER', 0, 3);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20118432', '20118432', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Tôn Long Phước', 'phuocton@gmail.com', '0315125678', 'MALE', 'DOCTOR', 'LECTURER', 0, 3);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20418432', '20418432', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Đặng Thị Thu Hà', 'phuocton@gmail.com', '0315125678', 'FEMALE', 'MASTER', 'SUB_HEAD_LECTURER', 0, 3);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20046432', '20046432', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Nguyễn Trọng Tiến', 'tiennguyen@gmail.com', '0315125678', 'MALE', 'DOCTOR', 'LECTURER', 0, 3);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20098321', '20098321', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Lê Nhật Duy', 'duyle@gmail.com', '0304125600', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 4);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20156321', '20156321', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Hồ Đắc Quán', 'quanho@gmail.com', '0304125100', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 4);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20981321', '20981321', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Ngô Hữu Dũng', 'dungngo@gmail.com', '0304125122', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20174321', '20174321', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Tạ Duy Công Chiến', 'chienta@gmail.com', '0304134122', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 2);
INSERT INTO lecturers (id, username, password, full_name, email, gender, phone, degree, role, is_admin, major_id) VALUES ('20194321', '20194321', '$2y$12$7IGsuCmRaSKn/enVQI0yXemQQCWQF5rI647UftquKkdMvIJg0AvB.', 'Nguyễn Chí Kiên', 'kiennguyen@gmail.com', '0308934122', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 5);

-- Lecturer term (lecturer_id, term_id)
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20018432', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20118432', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20418432', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20046432', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20098321', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20156321', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20981321', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20174321', 1);
INSERT INTO lecturer_terms (lecturer_id, term_id) VALUES ('20194321', 1);

-- Topic (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status('PENDING','APPROVED','REJECTED'), level('LOW','MEDIUM','HIGH'), lecturer_term_id)
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 1', 'Description 1', 2, 'Note 1', 'Target 1', 'Standard output 1', 'Require input 1', 'Comment 1', 'PENDING', 'LOW', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 2', 'Description 2', 2, 'Note 2', 'Target 2', 'Standard output 2', 'Require input 2', 'Comment 2', 'PENDING', 'MEDIUM', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 3', 'Description 3', 2, 'Note 3', 'Target 3', 'Standard output 3', 'Require input 3', 'Comment 3', 'PENDING', 'HIGH', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 4', 'Description 4', 2, 'Note 4', 'Target 4', 'Standard output 4', 'Require input 4', 'Comment 4', 'PENDING', 'LOW', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 5', 'Description 5', 2, 'Note 5', 'Target 5', 'Standard output 5', 'Require input 5', 'Comment 5', 'PENDING', 'MEDIUM', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 6', 'Description 6', 2, 'Note 6', 'Target 6', 'Standard output 6', 'Require input 6', 'Comment 6', 'PENDING', 'HIGH', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 7', 'Description 7', 2, 'Note 7', 'Target 7', 'Standard output 7', 'Require input 7', 'Comment 7', 'PENDING', 'LOW', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 8', 'Description 8', 2, 'Note 8', 'Target 8', 'Standard output 8', 'Require input 8', 'Comment 8', 'PENDING', 'MEDIUM', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 9', 'Description 9', 2, 'Note 9', 'Target 9', 'Standard output 9', 'Require input 9', 'Comment 9', 'PENDING', 'HIGH', 1);
INSERT INTO topics (name, description, quantity_group_max, note, target, standard_output, require_input, comment, status, level, lecturer_term_id) VALUES ('Topic 10', 'Description 10', 2, 'Note 10', 'Target 10', 'Standard output 10', 'Require input 10', 'Comment 10', 'PENDING', 'LOW', 1);

-- Group student (name, status('OPEN','FAIL_ADVISOR','FAIL_REVIEWER','FAIL_SESSION_HOST','PASS_ADVISOR','PASS_REVIEWER','PASS_SESSION_HOST'), type_report('OPEN','POSTER','SESSION_HOST'), topic_id, term_id)
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 1', 'OPEN', 'OPEN', 1, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 2', 'OPEN', 'OPEN', 2, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 3', 'OPEN', 'OPEN', 3, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 4', 'OPEN', 'OPEN', 4, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 5', 'OPEN', 'OPEN', 5, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 6', 'OPEN', 'OPEN', 6, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 7', 'OPEN', 'OPEN', 7, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 8', 'OPEN', 'OPEN', 8, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 9', 'OPEN', 'OPEN', 9, 1);
INSERT INTO group_students (name, status, type_report, topic_id, term_id) VALUES ('Group 10', 'OPEN', 'OPEN', 10, 1);

-- Group lecturer (name, type('ADVISOR','REVIEWER','SESSION_HOST'), term_id)
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 1', 'ADVISOR', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 2', 'ADVISOR', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 3', 'ADVISOR', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 4', 'REVIEWER', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 5', 'REVIEWER', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 6', 'REVIEWER', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 7', 'SESSION_HOST', 1);
INSERT INTO group_lecturers (name, type, term_id) VALUES ('Group 8', 'SESSION_HOST', 1);

-- Group lecturer members (lecturer_term_id, group_lecturer_id)
INSERT INTO group_lecturer_members (lecturer_term_id, group_lecturer_id) VALUES (1, 1);
INSERT INTO group_lecturer_members (lecturer_term_id, group_lecturer_id) VALUES (2, 1);
INSERT INTO group_lecturer_members (lecturer_term_id, group_lecturer_id) VALUES (3, 2);
INSERT INTO group_lecturer_members (lecturer_term_id, group_lecturer_id) VALUES (4, 2);
INSERT INTO group_lecturer_members (lecturer_term_id, group_lecturer_id) VALUES (5, 3);
INSERT INTO group_lecturer_members (lecturer_term_id, group_lecturer_id) VALUES (6, 3);

-- Student term (student_id, term_id, is_admin, group_student_id)
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('21084321', 1, 0, 1);
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('21092341', 1, 0, 2);
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('21062341', 1, 0, 3);
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('21112142', 1, 0, 4);
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('21232341', 1, 0, 5);
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('20512341', 1, 0, 6);
INSERT INTO student_terms (student_id, term_id, is_admin, group_student_id) VALUES ('21021234', 1, 0, 7);

-- Assign(type_evaluation('ADVISOR','REVIEWER','SESSION_HOST'), group_lecturer_id, group_student_id)
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('ADVISOR', 1, 1);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('ADVISOR', 2, 2);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('ADVISOR', 3, 3);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('REVIEWER', 4, 4);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('REVIEWER', 5, 5);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('REVIEWER', 6, 6);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('SESSION_HOST', 7, 7);
INSERT INTO assigns (type_evaluation, group_lecturer_id, group_student_id) VALUES ('SESSION_HOST', 8, 8);

-- Evaluation (name, score_max, description, type('ADVISOR','REVIEWER','SESSION_HOST'), term_id)
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Advisor 1', 10, 'Description 1', 'ADVISOR', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Advisor 2', 10, 'Description 2', 'ADVISOR', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Advisor 3', 10, 'Description 3', 'ADVISOR', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Reviewer 1', 10, 'Description 1', 'REVIEWER', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Reviewer 2', 10, 'Description 2', 'REVIEWER', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Reviewer 3', 10, 'Description 3', 'REVIEWER', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Session host 1', 10, 'Description 1', 'SESSION', 1);
INSERT INTO evaluations (name, score_max, description, type, term_id) VALUES ('Session host 2', 10, 'Description 2', 'SESSION', 1);

-- Achievement (name, bonus_score, student_term_id)
INSERT INTO achievements (name, bonus_score, student_term_id) VALUES ('Achievement 1', 1, 1);
INSERT INTO achievements (name, bonus_score, student_term_id) VALUES ('Achievement 2', 2, 2);
INSERT INTO achievements (name, bonus_score, student_term_id) VALUES ('Achievement 3', 3, 3);

-- Transcript(score, student_term_id, evaluation_id, lecturer_term_id)
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (10, 1, 1, 1);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (9, 2, 2, 2);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (8, 3, 3, 3);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (7, 4, 4, 4);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (6, 5, 5, 5);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (5, 6, 6, 6);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (4, 7, 7, 7);
INSERT INTO transcripts (score, student_term_id, evaluation_id, lecturer_term_id) VALUES (3, 8, 8, 8);

-- Notification student (message, is_read, student_id)
INSERT INTO notification_students (message, is_read, student_id) VALUES ('Notification 1', 0, '21084321');
INSERT INTO notification_students (message, is_read, student_id) VALUES ('Notification 2', 0, '21092341');
INSERT INTO notification_students (message, is_read, student_id) VALUES ('Notification 3', 0, '21062341');
INSERT INTO notification_students (message, is_read, student_id) VALUES ('Notification 4', 0, '21084321');
INSERT INTO notification_students (message, is_read, student_id) VALUES ('Notification 5', 0, '21092341');
INSERT INTO notification_students (message, is_read, student_id) VALUES ('Notification 6', 0, '21084321');

-- Notification lecturer (message, is_read, lecturer_id)
INSERT INTO notification_lecturers (message, is_read, lecturer_id) VALUES ('Notification 1', 0, '20018432');
INSERT INTO notification_lecturers (message, is_read, lecturer_id) VALUES ('Notification 2', 0, '20118432');
INSERT INTO notification_lecturers (message, is_read, lecturer_id) VALUES ('Notification 3', 0, '20018432');
INSERT INTO notification_lecturers (message, is_read, lecturer_id) VALUES ('Notification 4', 0, '20118432');
INSERT INTO notification_lecturers (message, is_read, lecturer_id) VALUES ('Notification 5', 0, '20018432');
INSERT INTO notification_lecturers (message, is_read, lecturer_id) VALUES ('Notification 6', 0, '20118432');
```












