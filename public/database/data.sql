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

-- Dumping data for table manage_graduation_se_iuh.achievements: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.assigns: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.evaluations: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.group_lecturers: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.group_lecturer_members: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.group_students: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.lecturers: ~1 rows (approximately)
INSERT INTO `lecturers` (`id`, `username`, `password`, `full_name`, `phone`, `email`, `gender`, `degree`, `is_active`, `created_at`, `updated_at`, `major_id`) VALUES
	('ff1c5c71-142d-4fee-8948-8de7ecb7128d', '21084321', '$2b$10$/qdBK7JtUv6C1k7pCIAIvum00/0rQpisJ3hHjqSGlvqX2hRZBA2ty', 'Nguyễn Thị Hạnh', '0304125678', 'hanhnguyen@gmail.com', 'FEMALE', 'DOCTOR', 1, '2024-07-12 15:36:50', '2024-07-12 15:36:50', 'e4fe02cb-f2b0-4afa-885d-d1b93130d350');

-- Dumping data for table manage_graduation_se_iuh.lecturer_terms: ~1 rows (approximately)
INSERT INTO `lecturer_terms` (`id`, `created_at`, `updated_at`, `lecturer_id`, `term_id`) VALUES
	('8412b6bd-5094-46d0-8109-dbb25fdf4bf9', '2024-07-12 15:36:50', '2024-07-12 15:36:50', 'ff1c5c71-142d-4fee-8948-8de7ecb7128d', '158861f1-9d9a-47f6-97d3-547f5d6809cc');

-- Dumping data for table manage_graduation_se_iuh.majors: ~5 rows (approximately)
INSERT INTO `majors` (`id`, `name`, `created_at`, `updated_at`) VALUES
	('2d1961b7-3ee4-48af-8de9-6eb83d3a235c', 'Hệ thống thông tin', '2024-06-12 16:26:31', '2024-07-02 22:06:18'),
	('67530b71-04c2-4178-b85a-bbe54d436bec', 'Công nghệ thông tin', '2024-06-12 16:26:44', '2024-06-12 16:26:44'),
	('7c4dac41-bb68-4bd0-90db-358a5dc67df2', 'Khoa học máy tính', '2024-06-12 16:27:04', '2024-06-12 16:27:04'),
	('e4fe02cb-f2b0-4afa-885d-d1b93130d350', 'Kỹ thuật phần mềm', '2024-06-12 16:26:50', '2024-07-02 18:47:59'),
	('fd81793a-2a0a-494d-8d08-d8faf95db82c', 'Khoa học dữ liệu', '2024-06-12 16:27:19', '2024-06-12 16:27:19');

-- Dumping data for table manage_graduation_se_iuh.notification_lecturers: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.notification_students: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.roles: ~1 rows (approximately)
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`, `lecturer_id`) VALUES
	('1f477e84-d4e1-4953-9846-da4a813b2db8', 'HEAD_COURSE', '2024-07-12 16:29:16', '2024-07-12 16:29:16', 'ff1c5c71-142d-4fee-8948-8de7ecb7128d'),
	('a1fa4ca6-37b8-46c3-b032-aa5c4215644f', 'LECTURER', '2024-07-12 15:36:50', '2024-07-12 15:36:50', 'ff1c5c71-142d-4fee-8948-8de7ecb7128d');

-- Dumping data for table manage_graduation_se_iuh.students: ~0 rows (approximately)
INSERT INTO `students` (`id`, `username`, `password`, `full_name`, `phone`, `email`, `gender`, `clazz_name`, `type_training`, `is_active`, `created_at`, `updated_at`, `major_id`) VALUES
	('efe66ac3-2015-49a9-871e-9c093b916a07', '21094320', '$2b$10$.77Nucu4unWelti.GxrU8eKUDZp5aDsqRNo.ZjUvVwnkBSSN59ymS', 'Nguyễn Như Ngọc', '0123456789', 'ngoc@gmail.com', 'FEMALE', 'DHKTPM17A', 'UNIVERSITY', 1, '2024-07-12 16:29:30', '2024-07-12 16:29:30', 'e4fe02cb-f2b0-4afa-885d-d1b93130d350');

-- Dumping data for table manage_graduation_se_iuh.student_terms: ~0 rows (approximately)
INSERT INTO `student_terms` (`id`, `status`, `is_admin`, `created_at`, `updated_at`, `term_id`, `group_student_id`, `student_id`) VALUES
	('1fb55180-3eb5-4f83-b68d-58e58df2db8c', 'OPEN', 0, '2024-07-12 16:29:30', '2024-07-12 16:29:30', '158861f1-9d9a-47f6-97d3-547f5d6809cc', NULL, 'efe66ac3-2015-49a9-871e-9c093b916a07');

-- Dumping data for table manage_graduation_se_iuh.terms: ~2 rows (approximately)
INSERT INTO `terms` (`id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`, `major_id`) VALUES
	('158861f1-9d9a-47f6-97d3-547f5d6809cc', 'HK3_2023-2024', '2024-06-02 07:00:00', '2024-08-03 07:00:00', '2024-07-12 15:32:50', '2024-07-12 15:32:50', 'e4fe02cb-f2b0-4afa-885d-d1b93130d350'),
	('8efb6d80-2a76-4a63-9a75-cd493abfa932', 'HK1_2023-2024', '2023-08-10 07:00:00', '2024-12-20 07:00:00', '2024-07-12 15:31:24', '2024-07-12 15:31:24', 'e4fe02cb-f2b0-4afa-885d-d1b93130d350'),
	('ffad99de-9867-44b7-9296-57d3bb69213b', 'HK2_2023-2024', '2023-12-20 07:00:00', '2024-06-01 07:00:00', '2024-07-12 15:32:11', '2024-07-12 15:32:11', 'e4fe02cb-f2b0-4afa-885d-d1b93130d350');

-- Dumping data for table manage_graduation_se_iuh.term_details: ~15 rows (approximately)
INSERT INTO `term_details` (`id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`, `term_id`) VALUES
	('083b446a-6c42-4a68-aa29-7edeb8a71d24', 'PUBLIC_RESULT', '2023-12-20 07:00:00', '2024-06-01 07:00:00', '2024-07-12 15:32:11', '2024-07-12 15:32:11', 'ffad99de-9867-44b7-9296-57d3bb69213b'),
	('15163b60-7561-431f-ad33-f01e94bfe2fe', 'DISCUSSION', '2024-06-02 07:00:00', '2024-08-03 07:00:00', '2024-07-12 15:32:50', '2024-07-12 15:32:50', '158861f1-9d9a-47f6-97d3-547f5d6809cc'),
	('1b383533-bde4-47ae-969b-eebc8874a590', 'CHOOSE_GROUP', '2024-06-02 07:00:00', '2024-08-03 07:00:00', '2024-07-12 15:32:50', '2024-07-12 15:32:50', '158861f1-9d9a-47f6-97d3-547f5d6809cc'),
	('1f77575c-731c-4326-be9c-abee4dbab463', 'CHOOSE_TOPIC', '2023-12-20 07:00:00', '2024-06-01 07:00:00', '2024-07-12 15:32:11', '2024-07-12 15:32:11', 'ffad99de-9867-44b7-9296-57d3bb69213b'),
	('5e95d850-7085-4126-90c7-d8634a9ae895', 'REPORT', '2023-12-20 07:00:00', '2024-06-01 07:00:00', '2024-07-12 15:32:11', '2024-07-12 15:32:11', 'ffad99de-9867-44b7-9296-57d3bb69213b'),
	('62db308e-4a84-490f-a314-fde44afbbf9b', 'CHOOSE_GROUP', '2023-12-20 07:00:00', '2024-06-01 07:00:00', '2024-07-12 15:32:11', '2024-07-12 15:32:11', 'ffad99de-9867-44b7-9296-57d3bb69213b'),
	('681bdf71-c1c4-4c87-a423-e9e89d9ab523', 'DISCUSSION', '2023-12-20 07:00:00', '2024-06-01 07:00:00', '2024-07-12 15:32:11', '2024-07-12 15:32:11', 'ffad99de-9867-44b7-9296-57d3bb69213b'),
	('74f1cc4b-c5d1-4911-b12e-47a8858634fa', 'CHOOSE_GROUP', '2023-08-10 07:00:00', '2024-12-20 07:00:00', '2024-07-12 15:31:24', '2024-07-12 15:31:24', '8efb6d80-2a76-4a63-9a75-cd493abfa932'),
	('776f4a9c-5b57-414c-b2d2-bfbcbbab31e9', 'CHOOSE_TOPIC', '2023-08-10 07:00:00', '2024-12-20 07:00:00', '2024-07-12 15:31:24', '2024-07-12 15:31:24', '8efb6d80-2a76-4a63-9a75-cd493abfa932'),
	('77d6c1b3-e589-432b-ac23-05c85f023ff6', 'REPORT', '2023-08-10 07:00:00', '2024-12-20 07:00:00', '2024-07-12 15:31:24', '2024-07-12 15:31:24', '8efb6d80-2a76-4a63-9a75-cd493abfa932'),
	('83e0c0fd-fce1-404c-ac83-e15ac046d70e', 'DISCUSSION', '2023-08-10 07:00:00', '2024-12-20 07:00:00', '2024-07-12 15:31:24', '2024-07-12 15:31:24', '8efb6d80-2a76-4a63-9a75-cd493abfa932'),
	('cb9b004f-e3d2-4c34-abff-bc68ae0b36c6', 'REPORT', '2024-06-02 07:00:00', '2024-08-03 07:00:00', '2024-07-12 15:32:50', '2024-07-12 15:32:50', '158861f1-9d9a-47f6-97d3-547f5d6809cc'),
	('ce72a812-4fb5-48bc-a2d5-0ac2710bfbe7', 'CHOOSE_TOPIC', '2024-06-02 07:00:00', '2024-08-03 07:00:00', '2024-07-12 15:32:50', '2024-07-12 15:32:50', '158861f1-9d9a-47f6-97d3-547f5d6809cc'),
	('da19d36a-e96b-4e87-a2d5-a522a9b79f71', 'PUBLIC_RESULT', '2023-08-10 07:00:00', '2024-12-20 07:00:00', '2024-07-12 15:31:24', '2024-07-12 15:31:24', '8efb6d80-2a76-4a63-9a75-cd493abfa932'),
	('f4eb1c42-41e2-447c-80e0-7ea79dcc3c71', 'PUBLIC_RESULT', '2024-06-02 07:00:00', '2024-08-03 07:00:00', '2024-07-12 15:32:50', '2024-07-12 15:32:50', '158861f1-9d9a-47f6-97d3-547f5d6809cc');

-- Dumping data for table manage_graduation_se_iuh.topics: ~0 rows (approximately)

-- Dumping data for table manage_graduation_se_iuh.transcripts: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
