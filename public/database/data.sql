-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table manage_graduation_se_iuh.achievements: ~3 rows (approximately)
INSERT INTO `achievements` (`id`, `name`, `bonus_score`, `created_at`, `updated_at`, `student_term_id`) VALUES
	(1, 'Achievement 1', 1, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(2, 'Achievement 2', 2, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 2),
	(3, 'Achievement 3', 3, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 3);

-- Dumping data for table manage_graduation_se_iuh.assigns: ~0 rows (approximately)
INSERT INTO `assigns` (`id`, `type_evaluation`, `created_at`, `updated_at`, `group_lecturer_id`, `group_student_id`) VALUES
	(1, 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 1),
	(2, 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2, 2),
	(3, 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3, 3),
	(4, 'REVIEWER', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4, 4),
	(5, 'REVIEWER', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5, 5),
	(6, 'REVIEWER', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6, 6),
	(7, 'SESSION_HOST', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 7, 7),
	(8, 'SESSION_HOST', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 8, 8);

-- Dumping data for table manage_graduation_se_iuh.evaluations: ~0 rows (approximately)
INSERT INTO `evaluations` (`id`, `name`, `score_max`, `description`, `type`, `created_at`, `updated_at`, `term_id`) VALUES
	(1, 'Advisor 1', 10, 'Description 1', 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(2, 'Advisor 2', 10, 'Description 2', 'ADVISOR', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(3, 'Advisor 3', 10, 'Description 3', 'ADVISOR', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(4, 'Reviewer 1', 10, 'Description 1', 'REVIEWER', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(5, 'Reviewer 2', 10, 'Description 2', 'REVIEWER', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(6, 'Reviewer 3', 10, 'Description 3', 'REVIEWER', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(7, 'Session host 1', 10, 'Description 1', '', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1),
	(8, 'Session host 2', 10, 'Description 2', '', '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1);

-- Dumping data for table manage_graduation_se_iuh.group_lecturers: ~8 rows (approximately)
INSERT INTO `group_lecturers` (`id`, `name`, `type`, `created_at`, `updated_at`, `term_id`) VALUES
	(1, 'Group 1', 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(2, 'Group 2', 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(3, 'Group 3', 'ADVISOR', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(4, 'Group 4', 'REVIEWER', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(5, 'Group 5', 'REVIEWER', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(6, 'Group 6', 'REVIEWER', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(7, 'Group 7', 'SESSION_HOST', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(8, 'Group 8', 'SESSION_HOST', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1);

-- Dumping data for table manage_graduation_se_iuh.group_lecturer_members: ~0 rows (approximately)
INSERT INTO `group_lecturer_members` (`id`, `created_at`, `updated_at`, `lecturer_term_id`, `group_lecturer_id`) VALUES
	(1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 1),
	(2, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2, 1),
	(3, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3, 2),
	(4, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4, 2),
	(5, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5, 3),
	(6, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6, 3);

-- Dumping data for table manage_graduation_se_iuh.group_students: ~0 rows (approximately)
INSERT INTO `group_students` (`id`, `name`, `type_report`, `created_at`, `updated_at`, `topic_id`, `term_id`) VALUES
	(1, 'Nhóm số 1', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 1),
	(2, 'Nhóm số 2', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2, 1),
	(3, 'Nhóm số 3', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3, 1),
	(4, 'Nhóm số 4', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4, 1),
	(5, 'Nhóm số 5', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5, 1),
	(6, 'Nhóm số 6', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6, 1),
	(7, 'Nhóm số 7', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 7, 1),
	(8, 'Nhóm số 8', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 8, 1),
	(9, 'Nhóm số 9', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 9, 1),
	(10, 'Nhóm số 10', 'OPEN', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 10, 1);

-- Dumping data for table manage_graduation_se_iuh.lecturers: ~9 rows (approximately)
INSERT INTO `lecturers` (`id`, `username`, `password`, `full_name`, `avatar`, `phone`, `email`, `gender`, `degree`, `role`, `is_admin`, `is_active`, `created_at`, `updated_at`, `major_id`) VALUES
	('20018432', '20018432', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Nguyễn Thị Hạnh', NULL, '0304125678', 'hanhnguyen@gmail.com', 'FEMALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('20046432', '20046432', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Nguyễn Trọng Tiến', NULL, '0315125678', 'tiennguyen@gmail.com', 'MALE', 'DOCTOR', 'LECTURER', 0, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('20098321', '20098321', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Lê Nhật Duy', NULL, '0304125600', 'duyle@gmail.com', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	('20118432', '20118432', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Tôn Long Phước', NULL, '0315125678', 'phuocton@gmail.com', 'MALE', 'DOCTOR', 'LECTURER', 0, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('20156321', '20156321', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Hồ Đắc Quán', NULL, '0304125100', 'quanho@gmail.com', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	('20174321', '20174321', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Tạ Duy Công Chiến', NULL, '0304134122', 'chienta@gmail.com', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2),
	('20194321', '20194321', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Nguyễn Chí Kiên', NULL, '0308934122', 'kiennguyen@gmail.com', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	('20418432', '20418432', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Đặng Thị Thu Hà', NULL, '0315125678', 'phuocton@gmail.com', 'FEMALE', 'MASTER', 'SUB_HEAD_LECTURER', 0, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('20981321', '20981321', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Ngô Hữu Dũng', NULL, '0304125122', 'dungngo@gmail.com', 'MALE', 'DOCTOR', 'HEAD_LECTURER', 1, 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1);

-- Dumping data for table manage_graduation_se_iuh.lecturer_terms: ~0 rows (approximately)
INSERT INTO `lecturer_terms` (`id`, `created_at`, `updated_at`, `lecturer_id`, `term_id`) VALUES
	(1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20018432', 1),
	(2, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20118432', 1),
	(3, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20418432', 1),
	(4, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20046432', 1),
	(5, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20098321', 1),
	(6, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20156321', 1),
	(7, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20981321', 1),
	(8, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20174321', 1),
	(9, '2024-05-18 13:34:01', '2024-05-18 13:34:01', '20194321', 1);

-- Dumping data for table manage_graduation_se_iuh.majors: ~5 rows (approximately)
INSERT INTO `majors` (`name`, `created_at`, `updated_at`) VALUES
	('Hệ thống thông tin', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	('Công nghệ thông tin', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	('Kỹ thuật phần mềm', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	('Khoa học máy tính', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	('Khoa học dữ liệu', '2024-05-18 13:34:01', '2024-05-18 13:34:01');

-- Dumping data for table manage_graduation_se_iuh.notification_lecturers: ~6 rows (approximately)
INSERT INTO `notification_lecturers` (`id`, `message`, `is_read`, `created_at`, `updated_at`, `lecturer_id`) VALUES
	(1, 'Notification 1', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '20018432'),
	(2, 'Notification 2', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '20118432'),
	(3, 'Notification 3', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '20018432'),
	(4, 'Notification 4', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '20118432'),
	(5, 'Notification 5', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '20018432'),
	(6, 'Notification 6', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '20118432');

-- Dumping data for table manage_graduation_se_iuh.notification_students: ~6 rows (approximately)
INSERT INTO `notification_students` (`id`, `message`, `is_read`, `created_at`, `updated_at`, `student_id`) VALUES
	(1, 'Notification 1', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '21084321'),
	(2, 'Notification 2', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '21092341'),
	(3, 'Notification 3', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '21062341'),
	(4, 'Notification 4', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '21084321'),
	(5, 'Notification 5', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '21092341'),
	(6, 'Notification 6', 0, '2024-05-18 13:34:02', '2024-05-18 13:34:02', '21084321');

-- Dumping data for table manage_graduation_se_iuh.students: ~7 rows (approximately)
INSERT INTO `students` (`id`, `username`, `password`, `full_name`, `avatar`, `phone`, `email`, `gender`, `date_of_birth`, `clazz_name`, `type_training`, `is_active`, `created_at`, `updated_at`, `major_id`) VALUES
	('20512341', '20052341', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Nguyễn Văn Tiến', NULL, '0321124431', 'tiennguyen@gmail.com', 'MALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	('21021234', '21021234', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Phạm Thị Hương', NULL, '0321124446', 'huongpham@gmail.com', 'FEMALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	('21062341', '21062341', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Đỗ Chí Tường', NULL, '0326224436', 'tuongnguyen@gmail.com', 'MALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('21084321', '21084321', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Nguyễn Huy Hoàng', NULL, '0327194436', 'hoangnguyen@gmail.com', 'MALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('21092341', '21092341', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Lê Minh Quang', NULL, '0326104436', 'quangnguyen@gmail.com', 'MALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	('21112142', '21112142', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Trần Thị Tường Vy', NULL, '0321124439', 'vynguyen@gmail.com', 'FEMALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	('21232341', '21232341', '$2b$10$mFPLV3lpxATUyl.8DFo7Ee7lK86L1J8TQByvREQUudY0Nt0hWTjga', 'Trần Thị Yến Nhi', NULL, '0321124430', 'nhitran@gmail.com', 'FEMALE', NULL, 'DHKTPM17C', 'UNIVERSITY', 1, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2);

-- Dumping data for table manage_graduation_se_iuh.student_terms: ~7 rows (approximately)
INSERT INTO `student_terms` (`id`, `status`, `is_admin`, `created_at`, `updated_at`, `term_id`, `group_student_id`, `student_id`) VALUES
	(1, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 1, '21084321'),
	(2, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 2, '21092341'),
	(3, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 3, '21062341'),
	(4, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 4, '21112142'),
	(5, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 5, '21232341'),
	(6, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 6, '20512341'),
	(7, 'OPEN', 0, '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1, 7, '21021234');

-- Dumping data for table manage_graduation_se_iuh.terms: ~6 rows (approximately)
INSERT INTO `terms` (`id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
	(1, 'HK1_2023-2024', '2023-09-01 00:00:00', '2024-01-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	(2, 'HK2_2023-2024', '2024-01-02 00:00:00', '2024-05-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	(3, 'HK3_2023-2024', '2024-05-02 00:00:00', '2024-09-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	(4, 'HK1_2024-2025', '2024-09-02 00:00:00', '2025-01-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	(5, 'HK2_2024-2025', '2025-01-02 00:00:00', '2025-05-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01'),
	(6, 'HK3_2024-2025', '2025-05-02 00:00:00', '2025-09-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01');

-- Dumping data for table manage_graduation_se_iuh.term_details: ~30 rows (approximately)
INSERT INTO `term_details` (`id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`, `term_id`) VALUES
	(1, 'CHOOSE_GROUP', '2023-09-02 07:00:00', '2024-10-02 07:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(2, 'CHOOSE_TOPIC', '2023-10-02 00:00:00', '2023-10-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(3, 'DISCUSSION', '2023-10-16 00:00:00', '2023-11-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(4, 'REPORT', '2023-11-16 00:00:00', '2023-12-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(5, 'PUBLIC_RESULT', '2023-12-02 00:00:00', '2024-01-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(6, 'CHOOSE_GROUP', '2024-01-02 00:00:00', '2024-02-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2),
	(7, 'CHOOSE_TOPIC', '2024-02-02 00:00:00', '2024-02-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2),
	(8, 'DISCUSSION', '2024-02-16 00:00:00', '2024-03-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2),
	(9, 'REPORT', '2024-03-16 00:00:00', '2024-04-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2),
	(10, 'PUBLIC_RESULT', '2024-04-02 00:00:00', '2024-05-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 2),
	(11, 'CHOOSE_GROUP', '2024-05-02 00:00:00', '2024-06-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	(12, 'CHOOSE_TOPIC', '2024-06-02 00:00:00', '2024-06-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	(13, 'DISCUSSION', '2024-06-16 00:00:00', '2024-07-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	(14, 'REPORT', '2024-07-16 00:00:00', '2024-08-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	(15, 'PUBLIC_RESULT', '2024-08-02 00:00:00', '2024-09-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 3),
	(16, 'CHOOSE_GROUP', '2024-09-02 00:00:00', '2024-10-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	(17, 'CHOOSE_TOPIC', '2024-10-02 00:00:00', '2024-10-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	(18, 'DISCUSSION', '2024-10-16 00:00:00', '2024-11-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	(19, 'REPORT', '2024-11-16 00:00:00', '2024-12-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	(20, 'PUBLIC_RESULT', '2024-12-02 00:00:00', '2025-01-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 4),
	(21, 'CHOOSE_GROUP', '2025-01-02 00:00:00', '2025-02-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	(22, 'CHOOSE_TOPIC', '2025-02-02 00:00:00', '2025-02-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	(23, 'DISCUSSION', '2025-02-16 00:00:00', '2025-03-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	(24, 'REPORT', '2025-03-16 00:00:00', '2025-04-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	(25, 'PUBLIC_RESULT', '2025-04-02 00:00:00', '2025-05-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 5),
	(26, 'CHOOSE_GROUP', '2025-05-02 00:00:00', '2025-06-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6),
	(27, 'CHOOSE_TOPIC', '2025-06-02 00:00:00', '2025-06-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6),
	(28, 'DISCUSSION', '2025-06-16 00:00:00', '2025-07-15 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6),
	(29, 'REPORT', '2025-07-16 00:00:00', '2025-08-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6),
	(30, 'PUBLIC_RESULT', '2025-08-02 00:00:00', '2025-09-01 00:00:00', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 6);

-- Dumping data for table manage_graduation_se_iuh.topics: ~10 rows (approximately)
INSERT INTO `topics` (`id`, `name`, `description`, `quantity_group_max`, `note`, `target`, `standard_output`, `require_input`, `status`, `created_at`, `updated_at`, `lecturer_term_id`) VALUES
	(1, 'Topic 1', 'Description 1', 2, 'Note 1', 'Target 1', 'Standard output 1', 'Require input 1', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(2, 'Topic 2', 'Description 2', 2, 'Note 2', 'Target 2', 'Standard output 2', 'Require input 2', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(3, 'Topic 3', 'Description 3', 2, 'Note 3', 'Target 3', 'Standard output 3', 'Require input 3', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(4, 'Topic 4', 'Description 4', 2, 'Note 4', 'Target 4', 'Standard output 4', 'Require input 4', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(5, 'Topic 5', 'Description 5', 2, 'Note 5', 'Target 5', 'Standard output 5', 'Require input 5', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(6, 'Topic 6', 'Description 6', 2, 'Note 6', 'Target 6', 'Standard output 6', 'Require input 6', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(7, 'Topic 7', 'Description 7', 2, 'Note 7', 'Target 7', 'Standard output 7', 'Require input 7', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(8, 'Topic 8', 'Description 8', 2, 'Note 8', 'Target 8', 'Standard output 8', 'Require input 8', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(9, 'Topic 9', 'Description 9', 2, 'Note 9', 'Target 9', 'Standard output 9', 'Require input 9', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1),
	(10, 'Topic 10', 'Description 10', 2, 'Note 10', 'Target 10', 'Standard output 10', 'Require input 10', 'PENDING', '2024-05-18 13:34:01', '2024-05-18 13:34:01', 1);

-- Dumping data for table manage_graduation_se_iuh.transcripts: ~0 rows (approximately)
INSERT INTO `transcripts` (`id`, `score`, `created_at`, `updated_at`, `student_term_id`, `evaluation_id`, `lecturer_term_id`) VALUES
	(1, 10, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 1, 1, 1),
	(2, 9, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 2, 2, 2),
	(3, 8, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 3, 3, 3),
	(4, 7, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 4, 4, 4),
	(5, 6, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 5, 5, 5),
	(6, 5, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 6, 6, 6),
	(7, 4, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 7, 7, 7),
	(8, 3, '2024-05-18 13:34:02', '2024-05-18 13:34:02', 7, 8, 8);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
