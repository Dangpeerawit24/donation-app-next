-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 05, 2025 at 01:54 PM
-- Server version: 10.11.6-MariaDB-0+deb12u1-log
-- PHP Version: 8.3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kuanimtu_donationapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `Campaign`
--

CREATE TABLE `Campaign` (
  `id` int(11) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `respond` varchar(191) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `detailsname` varchar(191) DEFAULT 'false',
  `detailsbirthdate` varchar(191) DEFAULT 'false',
  `detailstext` varchar(191) DEFAULT 'false',
  `detailswish` varchar(191) DEFAULT 'false',
  `campaign_img` varchar(191) DEFAULT NULL,
  `campaign_imgpush` varchar(191) DEFAULT NULL,
  `status` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `topicId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Campaign_transactions`
--

CREATE TABLE `Campaign_transactions` (
  `id` int(11) NOT NULL,
  `campaignsname` varchar(191) NOT NULL,
  `lineId` varchar(191) DEFAULT NULL,
  `transactionID` varchar(191) DEFAULT NULL,
  `lineName` varchar(191) NOT NULL,
  `form` varchar(191) NOT NULL,
  `value` varchar(191) DEFAULT NULL,
  `details` varchar(191) DEFAULT NULL,
  `detailsname` varchar(191) DEFAULT NULL,
  `detailsbirthdate` varchar(191) DEFAULT NULL,
  `detailsbirthmonth` varchar(191) DEFAULT NULL,
  `detailsbirthyear` varchar(191) DEFAULT NULL,
  `detailsbirthtime` varchar(191) DEFAULT NULL,
  `detailsbirthconstellation` varchar(191) DEFAULT NULL,
  `detailsbirthage` varchar(191) DEFAULT NULL,
  `detailstext` varchar(191) DEFAULT NULL,
  `detailswish` varchar(191) DEFAULT NULL,
  `slip` varchar(191) DEFAULT NULL,
  `url_img` varchar(191) DEFAULT NULL,
  `qr_url` varchar(191) DEFAULT NULL,
  `status` varchar(191) DEFAULT NULL,
  `notify` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `campaignsid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Line_users`
--

CREATE TABLE `Line_users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `display_name` varchar(191) NOT NULL,
  `picture_url` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Topic`
--

CREATE TABLE `Topic` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `lineuid` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'user',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `name`, `email`, `lineuid`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('1', 'admin', 'admin@example.com', 'U2eeb126bb000360fdd5cc0fa950623a9', '$2a$12$77qK5ZggIh0C0RF71.XpmO62IWLaPHTUNBxOMHDZGHPpE1TCYd8GK', 'admin', '2025-03-05 08:22:30.000', '2025-03-05 05:44:12.229');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Campaign`
--
ALTER TABLE `Campaign`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Campaign_topicId_fkey` (`topicId`);

--
-- Indexes for table `Campaign_transactions`
--
ALTER TABLE `Campaign_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Campaign_transactions_campaignsid_fkey` (`campaignsid`);

--
-- Indexes for table `Line_users`
--
ALTER TABLE `Line_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Topic`
--
ALTER TABLE `Topic`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_lineuid_key` (`lineuid`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Campaign`
--
ALTER TABLE `Campaign`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Campaign_transactions`
--
ALTER TABLE `Campaign_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Line_users`
--
ALTER TABLE `Line_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Topic`
--
ALTER TABLE `Topic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Campaign`
--
ALTER TABLE `Campaign`
  ADD CONSTRAINT `Campaign_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Campaign_transactions`
--
ALTER TABLE `Campaign_transactions`
  ADD CONSTRAINT `Campaign_transactions_campaignsid_fkey` FOREIGN KEY (`campaignsid`) REFERENCES `Campaign` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
