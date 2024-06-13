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


-- Dumping database structure for manage_graduation_se_iuh
CREATE DATABASE IF NOT EXISTS `manage_graduation_se_iuh` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `manage_graduation_se_iuh`;

-- Dumping structure for table manage_graduation_se_iuh.achievements
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `bonus_score` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `student_term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_term_id` (`student_term_id`),
  CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`student_term_id`) REFERENCES `student_terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.achievements: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.assigns
CREATE TABLE IF NOT EXISTS `assigns` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type_evaluation` enum('ADVISOR','REVIEWER','SESSION_HOST') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `group_lecturer_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `group_student_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_lecturer_id` (`group_lecturer_id`),
  KEY `group_student_id` (`group_student_id`),
  CONSTRAINT `assigns_ibfk_1` FOREIGN KEY (`group_lecturer_id`) REFERENCES `group_lecturers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assigns_ibfk_2` FOREIGN KEY (`group_student_id`) REFERENCES `group_students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.assigns: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.evaluations
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `score_max` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('ADVISOR','REVIEWER','SESSION_HOST') DEFAULT 'REVIEWER',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `term_id` (`term_id`),
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.evaluations: ~7 rows (approximately)
INSERT INTO `evaluations` (`id`, `name`, `score_max`, `description`, `type`, `created_at`, `updated_at`, `term_id`) VALUES
	('069f32eb-ae32-469a-a609-6a28b053314a', 'Write the project documentation according to predefined regulations.', 10, '[0 - 2) - Incomplete writing of the required chapters of a graduation thesis report.\r\n- There are no references cited.\r\n- Copy other thesis topics without citing them. ; [2 - 5) - Incomplete writing of the required chapters of a graduation thesis report.\r', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('06f6a0e2-846b-4ed8-a251-e4ab28a6dfd1', 'Identify the requirements of the project.', 10, '[0 - 2) - Identify less than 30% of requirements.\r\n- Failure to state the urgency, goals, and scope of the topic.\r\n- Unable to provide a plan to implement the project. ; [2 - 5) - Identify less than 50% of requirements.\r\n- State the urgency, goals, and sc', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('090f12d7-9b4e-4d7d-a669-e6005bef0702', 'Determine the techniques and technologies to address the identified requirements.', 10, '[0 - 2) Failure to provide techniques and technologies to address identified requirements. ; [2 - 5) Provide less than 40% of the techniques and technologies to address the identified requirements. ; [5 - 8) - Provide adequate techniques and technologies ', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('285e93ad-2bca-4f35-bcd1-9436963a615f', 'Implement the project according to the designed solution.', 20, '[0 - 4) - Implement less than 10% of the information system as designed. ; [4 - 10) - Implement up to 30% of the information system as designed. ; [10 - 16) - Implement up to 70% of the information system as designed. ; [16 - 20] - Implement over 70% of t', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('4e2c5959-b98f-4f80-bb35-34280e9b89b1', 'Evaluate the implemented results.', 10, '[0 - 2) - Failure to design and execute tests. ; [2 - 5) - Create incorrect test cases tables or do not test. ; [5 - 8) - Create a table of test cases for at least 3 main functions of the program.\r\n- Execute test cases. ; [8 - 10] - Create test cases for ', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('d4de3b2f-8c97-45c5-b847-329c519525c1', 'Design an engineering-based solution to meet the requirements of the project.', 20, '[0 - 4) - Can\'t design anything. ; [4 - 10) - Design a solution that meets less than 30% of the identified requirements of the system in the topic. ; [10 - 16) - Design a solution that meets up to 70% of the identified requirements of the system in the pr', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('e4894bfd-cc40-4a66-8a68-480275e0367d', 'Analyze and model the requirements of the project.', 20, '[0 - 4) - Unable to identify and analyze basic functional requirements of the system to be built in the project.\r\n- Do not model the current status and operations included in the requirements of the topic to be implemented. ; [4 - 10) - Identify and analy', 'ADVISOR', '2024-06-13 13:15:39', '2024-06-13 13:15:39', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa');

-- Dumping structure for table manage_graduation_se_iuh.group_lecturers
CREATE TABLE IF NOT EXISTS `group_lecturers` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('ADVISOR','REVIEWER','SESSION_HOST') DEFAULT 'REVIEWER',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `term_id` (`term_id`),
  CONSTRAINT `group_lecturers_ibfk_1` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.group_lecturers: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.group_lecturer_members
CREATE TABLE IF NOT EXISTS `group_lecturer_members` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `lecturer_term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `group_lecturer_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lecturer_term_id` (`lecturer_term_id`),
  KEY `group_lecturer_id` (`group_lecturer_id`),
  CONSTRAINT `group_lecturer_members_ibfk_1` FOREIGN KEY (`lecturer_term_id`) REFERENCES `lecturer_terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `group_lecturer_members_ibfk_2` FOREIGN KEY (`group_lecturer_id`) REFERENCES `group_lecturers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.group_lecturer_members: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.group_students
CREATE TABLE IF NOT EXISTS `group_students` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `type_report` enum('OPEN','POSTER','SESSION_HOST') NOT NULL DEFAULT 'OPEN',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `topic_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  KEY `term_id` (`term_id`),
  CONSTRAINT `group_students_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `group_students_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.group_students: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.lecturers
CREATE TABLE IF NOT EXISTS `lecturers` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` enum('MALE','FEMALE') DEFAULT NULL,
  `degree` enum('BACHELOR','MASTER','DOCTOR') DEFAULT 'MASTER',
  `role` enum('HEAD_LECTURER','LECTURER','SUB_HEAD_LECTURER') DEFAULT 'LECTURER',
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `major_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `major_id` (`major_id`),
  CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.lecturers: ~0 rows (approximately)
INSERT INTO `lecturers` (`id`, `username`, `password`, `full_name`, `avatar`, `phone`, `email`, `gender`, `degree`, `role`, `is_admin`, `is_active`, `created_at`, `updated_at`, `major_id`) VALUES
	('b5e09818-7337-4187-bb07-24ce63d039d2', '21084321', '$2b$10$rkxH/epOlccxqriztmZO8u8hNB77a/z3IqJghHbX.dWjOzpZfN/gS', 'Nguyễn Thị Hạnh', NULL, '0304125678', 'hanhnguyen@gmail.com', 'FEMALE', 'MASTER', 'HEAD_LECTURER', 0, 1, '2024-06-12 16:48:02', '2024-06-12 16:48:02', 'e4fe02cb-f2b0-4afa-885d-d1b93130d350');

-- Dumping structure for table manage_graduation_se_iuh.lecturer_terms
CREATE TABLE IF NOT EXISTS `lecturer_terms` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `lecturer_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lecturer_id` (`lecturer_id`),
  KEY `term_id` (`term_id`),
  CONSTRAINT `lecturer_terms_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `lecturer_terms_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.lecturer_terms: ~0 rows (approximately)
INSERT INTO `lecturer_terms` (`id`, `created_at`, `updated_at`, `lecturer_id`, `term_id`) VALUES
	('22e7a74c-0985-4c10-849d-bfda5d6a64d5', '2024-06-12 16:48:02', '2024-06-12 16:48:02', 'b5e09818-7337-4187-bb07-24ce63d039d2', '7d98a855-d805-4122-8649-a6ebab007c86');

-- Dumping structure for table manage_graduation_se_iuh.majors
CREATE TABLE IF NOT EXISTS `majors` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.majors: ~4 rows (approximately)
INSERT INTO `majors` (`id`, `name`, `created_at`, `updated_at`) VALUES
	('2d1961b7-3ee4-48af-8de9-6eb83d3a235c', 'Hệ thống thông tin', '2024-06-12 16:26:31', '2024-06-12 16:26:31'),
	('67530b71-04c2-4178-b85a-bbe54d436bec', 'Công nghệ thông tin', '2024-06-12 16:26:44', '2024-06-12 16:26:44'),
	('7c4dac41-bb68-4bd0-90db-358a5dc67df2', 'Khoa học máy tính', '2024-06-12 16:27:04', '2024-06-12 16:27:04'),
	('e4fe02cb-f2b0-4afa-885d-d1b93130d350', 'Kỹ thuật phần mềm', '2024-06-12 16:26:50', '2024-06-12 16:26:50'),
	('fd81793a-2a0a-494d-8d08-d8faf95db82c', 'Khoa học dữ liệu', '2024-06-12 16:27:19', '2024-06-12 16:27:19');

-- Dumping structure for table manage_graduation_se_iuh.notification_lecturers
CREATE TABLE IF NOT EXISTS `notification_lecturers` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `lecturer_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lecturer_id` (`lecturer_id`),
  CONSTRAINT `notification_lecturers_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.notification_lecturers: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.notification_students
CREATE TABLE IF NOT EXISTS `notification_students` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `student_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `notification_students_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.notification_students: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.students
CREATE TABLE IF NOT EXISTS `students` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` enum('MALE','FEMALE') DEFAULT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `clazz_name` varchar(255) DEFAULT NULL,
  `type_training` enum('COLLEGE','UNIVERSITY') NOT NULL DEFAULT 'UNIVERSITY',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `major_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `major_id` (`major_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.students: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.student_terms
CREATE TABLE IF NOT EXISTS `student_terms` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('OPEN','FAIL_ADVISOR','FAIL_REVIEWER','FAIL_SESSION_HOST','PASS_ADVISOR','PASS_REVIEWER','PASS_SESSION_HOST') NOT NULL DEFAULT 'OPEN',
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `group_student_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `student_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `term_id` (`term_id`),
  KEY `group_student_id` (`group_student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_terms_ibfk_1` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_terms_ibfk_2` FOREIGN KEY (`group_student_id`) REFERENCES `group_students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_terms_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.student_terms: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.terms
CREATE TABLE IF NOT EXISTS `terms` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.terms: ~6 rows (approximately)
INSERT INTO `terms` (`id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
	('36add2b6-6e88-4283-8c22-d79fef5af002', 'HK3_2024-2025', '2025-06-02 07:00:00', '2025-08-01 07:00:00', '2024-06-12 16:45:12', '2024-06-12 16:45:12'),
	('4e385168-5e79-42a1-8de5-a07f58e7c2a2', 'HK1_2023-2024', '2023-09-01 07:00:00', '2024-01-01 07:00:00', '2024-06-12 16:42:19', '2024-06-12 16:42:19'),
	('5769a425-b10b-4892-a839-b9336dc8aabb', 'HK2_2024-2025', '2025-12-26 07:00:00', '2025-06-02 07:00:00', '2024-06-12 16:44:46', '2024-06-12 16:44:46'),
	('7d98a855-d805-4122-8649-a6ebab007c86', 'HK1_2024-2025', '2024-08-02 07:00:00', '2025-12-22 07:00:00', '2024-06-12 16:43:56', '2024-06-12 16:43:56'),
	('dbd340ed-57db-47f1-abad-8e0ad4c9c1f9', 'HK2_2023-2024', '2024-01-02 07:00:00', '2024-05-01 07:00:00', '2024-06-12 16:42:53', '2024-06-12 16:42:53'),
	('f40bd6b8-d2a2-4477-9a06-f63801df53aa', 'HK3_2023-2024', '2024-06-02 07:00:00', '2024-08-01 07:00:00', '2024-06-12 16:43:22', '2024-06-12 16:43:22');

-- Dumping structure for table manage_graduation_se_iuh.term_details
CREATE TABLE IF NOT EXISTS `term_details` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` enum('CHOOSE_GROUP','CHOOSE_TOPIC','DISCUSSION','REPORT','PUBLIC_RESULT') NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `term_id` (`term_id`),
  CONSTRAINT `term_details_ibfk_1` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.term_details: ~30 rows (approximately)
INSERT INTO `term_details` (`id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`, `term_id`) VALUES
	('0501a281-38e2-4b8a-aa6e-cb88d027b351', 'PUBLIC_RESULT', '2024-06-02 07:00:00', '2024-08-01 07:00:00', '2024-06-12 16:43:22', '2024-06-12 16:43:22', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('09a4efaa-a5e7-4e2f-a85d-9eea8ce0e9e4', 'DISCUSSION', '2025-06-02 07:00:00', '2025-08-01 07:00:00', '2024-06-12 16:45:12', '2024-06-12 16:45:12', '36add2b6-6e88-4283-8c22-d79fef5af002'),
	('0f545bb4-0bee-4e9b-ad53-c69952cb50eb', 'CHOOSE_TOPIC', '2023-09-01 07:00:00', '2024-01-01 07:00:00', '2024-06-12 16:42:19', '2024-06-12 16:42:19', '4e385168-5e79-42a1-8de5-a07f58e7c2a2'),
	('12f6285c-9d56-4f64-8b35-bace9da72db9', 'DISCUSSION', '2024-01-02 07:00:00', '2024-05-01 07:00:00', '2024-06-12 16:42:53', '2024-06-12 16:42:53', 'dbd340ed-57db-47f1-abad-8e0ad4c9c1f9'),
	('17210390-f717-47ab-85a6-31a9bd032487', 'DISCUSSION', '2024-08-02 07:00:00', '2025-12-22 07:00:00', '2024-06-12 16:43:56', '2024-06-12 16:43:56', '7d98a855-d805-4122-8649-a6ebab007c86'),
	('2462df7f-567f-41c5-b51a-ee9f7ddece59', 'DISCUSSION', '2023-09-01 07:00:00', '2024-01-01 07:00:00', '2024-06-12 16:42:19', '2024-06-12 16:42:19', '4e385168-5e79-42a1-8de5-a07f58e7c2a2'),
	('2fa172d0-82ab-4257-b5ad-b8cea16b66f5', 'REPORT', '2025-12-26 07:00:00', '2025-06-02 07:00:00', '2024-06-12 16:44:46', '2024-06-12 16:44:46', '5769a425-b10b-4892-a839-b9336dc8aabb'),
	('35a92272-5d1e-4c4c-a848-c0ffb05be8d1', 'PUBLIC_RESULT', '2025-12-26 07:00:00', '2025-06-02 07:00:00', '2024-06-12 16:44:46', '2024-06-12 16:44:46', '5769a425-b10b-4892-a839-b9336dc8aabb'),
	('4b775d73-759e-4f99-baa0-3410c0539c8d', 'CHOOSE_TOPIC', '2024-01-02 07:00:00', '2024-05-01 07:00:00', '2024-06-12 16:42:53', '2024-06-12 16:42:53', 'dbd340ed-57db-47f1-abad-8e0ad4c9c1f9'),
	('53e274c3-a0ac-4e3b-94b3-f1c3555df7e3', 'REPORT', '2024-06-02 07:00:00', '2024-08-01 07:00:00', '2024-06-12 16:43:22', '2024-06-12 16:43:22', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('5b53c94f-8455-4a60-8b28-8f67ac584455', 'CHOOSE_GROUP', '2024-08-02 07:00:00', '2025-12-22 07:00:00', '2024-06-12 16:43:56', '2024-06-12 16:43:56', '7d98a855-d805-4122-8649-a6ebab007c86'),
	('5d214b83-b947-48f5-869a-89ed38d5a9f5', 'CHOOSE_TOPIC', '2025-12-26 07:00:00', '2025-06-02 07:00:00', '2024-06-12 16:44:46', '2024-06-12 16:44:46', '5769a425-b10b-4892-a839-b9336dc8aabb'),
	('600842ca-2f54-44ac-8a49-d91396362e52', 'CHOOSE_TOPIC', '2024-08-02 07:00:00', '2025-12-22 07:00:00', '2024-06-12 16:43:56', '2024-06-12 16:43:56', '7d98a855-d805-4122-8649-a6ebab007c86'),
	('6b7d2dee-b800-4c91-b949-7d6ab1338a38', 'CHOOSE_GROUP', '2024-01-02 07:00:00', '2024-05-01 07:00:00', '2024-06-12 16:42:53', '2024-06-12 16:42:53', 'dbd340ed-57db-47f1-abad-8e0ad4c9c1f9'),
	('79db546f-3cfa-4608-9976-2330ce9a4098', 'CHOOSE_TOPIC', '2025-06-02 07:00:00', '2025-08-01 07:00:00', '2024-06-12 16:45:12', '2024-06-12 16:45:12', '36add2b6-6e88-4283-8c22-d79fef5af002'),
	('7ac20bc2-5f9c-4af2-85e9-b476455adb4c', 'CHOOSE_GROUP', '2025-06-02 07:00:00', '2025-08-01 07:00:00', '2024-06-12 16:45:12', '2024-06-12 16:45:12', '36add2b6-6e88-4283-8c22-d79fef5af002'),
	('7b82ca8d-e6bf-46ad-9934-d5303edb91c8', 'REPORT', '2025-06-02 07:00:00', '2025-08-01 07:00:00', '2024-06-12 16:45:12', '2024-06-12 16:45:12', '36add2b6-6e88-4283-8c22-d79fef5af002'),
	('90be3473-2c3a-47ab-83a9-3b40dc4c1b8b', 'PUBLIC_RESULT', '2024-08-02 07:00:00', '2025-12-22 07:00:00', '2024-06-12 16:43:56', '2024-06-12 16:43:56', '7d98a855-d805-4122-8649-a6ebab007c86'),
	('9a1d4b98-deb5-4335-bcb0-f212c61094a7', 'REPORT', '2024-08-02 07:00:00', '2025-12-22 07:00:00', '2024-06-12 16:43:56', '2024-06-12 16:43:56', '7d98a855-d805-4122-8649-a6ebab007c86'),
	('9b6c7fc5-e614-4d32-81ba-4394d289da42', 'PUBLIC_RESULT', '2024-01-02 07:00:00', '2024-05-01 07:00:00', '2024-06-12 16:42:53', '2024-06-12 16:42:53', 'dbd340ed-57db-47f1-abad-8e0ad4c9c1f9'),
	('af6a4089-67a4-4b90-b021-d62dddae3110', 'CHOOSE_GROUP', '2023-09-01 07:00:00', '2024-01-01 07:00:00', '2024-06-12 16:42:19', '2024-06-12 16:42:19', '4e385168-5e79-42a1-8de5-a07f58e7c2a2'),
	('b764d56c-fd39-4d26-88ed-5653e3e47ca0', 'DISCUSSION', '2025-12-26 07:00:00', '2025-06-02 07:00:00', '2024-06-12 16:44:46', '2024-06-12 16:44:46', '5769a425-b10b-4892-a839-b9336dc8aabb'),
	('b8079b00-b4c1-4617-906b-ca8b766ae26d', 'REPORT', '2023-09-01 07:00:00', '2024-01-01 07:00:00', '2024-06-12 16:42:19', '2024-06-12 16:42:19', '4e385168-5e79-42a1-8de5-a07f58e7c2a2'),
	('be62a729-6656-4521-9fb4-c19b1fa073b4', 'CHOOSE_GROUP', '2024-06-02 07:00:00', '2024-08-01 07:00:00', '2024-06-12 16:43:22', '2024-06-12 16:43:22', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('bfadfba7-b238-4d03-be2e-f50f0d6a12a7', 'REPORT', '2024-01-02 07:00:00', '2024-05-01 07:00:00', '2024-06-12 16:42:53', '2024-06-12 16:42:53', 'dbd340ed-57db-47f1-abad-8e0ad4c9c1f9'),
	('d582451c-dc2e-451a-b424-008706167314', 'DISCUSSION', '2024-06-02 07:00:00', '2024-08-01 07:00:00', '2024-06-12 16:43:22', '2024-06-12 16:43:22', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('dd4cd20f-1725-4293-b565-270edae0fa14', 'CHOOSE_TOPIC', '2024-06-02 07:00:00', '2024-08-01 07:00:00', '2024-06-12 16:43:22', '2024-06-12 16:43:22', 'f40bd6b8-d2a2-4477-9a06-f63801df53aa'),
	('e9fbac57-f247-4f3d-9b86-21a8c667f8ec', 'CHOOSE_GROUP', '2025-12-26 07:00:00', '2025-06-02 07:00:00', '2024-06-12 16:44:46', '2024-06-12 16:44:46', '5769a425-b10b-4892-a839-b9336dc8aabb'),
	('eaa05283-d630-48e8-a658-de104adb33ee', 'PUBLIC_RESULT', '2023-09-01 07:00:00', '2024-01-01 07:00:00', '2024-06-12 16:42:19', '2024-06-12 16:42:19', '4e385168-5e79-42a1-8de5-a07f58e7c2a2'),
	('fd5f1622-cbaa-4f62-aff5-420d45bb0272', 'PUBLIC_RESULT', '2025-06-02 07:00:00', '2025-08-01 07:00:00', '2024-06-12 16:45:12', '2024-06-12 16:45:12', '36add2b6-6e88-4283-8c22-d79fef5af002');

-- Dumping structure for table manage_graduation_se_iuh.topics
CREATE TABLE IF NOT EXISTS `topics` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `quantity_group_max` int(11) NOT NULL,
  `note` text DEFAULT NULL,
  `target` text DEFAULT NULL,
  `standard_output` mediumtext DEFAULT NULL,
  `require_input` mediumtext DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `lecturer_term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lecturer_term_id` (`lecturer_term_id`),
  CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`lecturer_term_id`) REFERENCES `lecturer_terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.topics: ~0 rows (approximately)

-- Dumping structure for table manage_graduation_se_iuh.transcripts
CREATE TABLE IF NOT EXISTS `transcripts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `score` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `student_term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `evaluation_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `lecturer_term_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_term_id` (`student_term_id`),
  KEY `evaluation_id` (`evaluation_id`),
  KEY `lecturer_term_id` (`lecturer_term_id`),
  CONSTRAINT `transcripts_ibfk_1` FOREIGN KEY (`student_term_id`) REFERENCES `student_terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transcripts_ibfk_2` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transcripts_ibfk_3` FOREIGN KEY (`lecturer_term_id`) REFERENCES `lecturer_terms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table manage_graduation_se_iuh.transcripts: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
