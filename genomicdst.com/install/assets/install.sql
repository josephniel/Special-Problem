-- phpMyAdmin SQL Dump
-- version 4.2.12deb2+deb8u1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 28, 2016 at 02:11 PM
-- Server version: 5.5.49-0+deb8u1
-- PHP Version: 5.6.20-0+deb8u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `genomic_dst`
--

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE IF NOT EXISTS `diseases` (
`disease_id` int(11) NOT NULL,
  `disease_name` varchar(50) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `diseases`
--

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE IF NOT EXISTS `log` (
  `unit_id` int(11) NOT NULL,
  `content` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `log`
--

-- --------------------------------------------------------

--
-- Table structure for table `markers`
--

CREATE TABLE IF NOT EXISTS `markers` (
`marker_id` int(11) NOT NULL,
  `disease_id` int(11) NOT NULL,
  `chromosome` int(2) NOT NULL,
  `position` int(10) NOT NULL,
  `risk_snp` char(1) NOT NULL,
  `odds_ratio` decimal(3,2) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=275 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `markers`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`unit_id` int(11) NOT NULL,
  `unit_name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

-- --------------------------------------------------------

--
-- Table structure for table `user_table_status`
--

CREATE TABLE IF NOT EXISTS `user_table_status` (
  `unit_id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `disease_name` varchar(50) NOT NULL,
  `timestamp` varchar(25) NOT NULL,
  `isset` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_table_status`
--

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
 ADD PRIMARY KEY (`disease_id`);

--
-- Indexes for table `log`
--
ALTER TABLE `log`
 ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `markers`
--
ALTER TABLE `markers`
 ADD PRIMARY KEY (`marker_id`,`disease_id`), ADD KEY `disease_id` (`disease_id`), ADD KEY `disease_id_2` (`disease_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`unit_id`);

--
-- Indexes for table `user_table_status`
--
ALTER TABLE `user_table_status`
 ADD PRIMARY KEY (`unit_id`,`table_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `markers`
--
ALTER TABLE `markers`
MODIFY `marker_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=1;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `log`
--
ALTER TABLE `log`
ADD CONSTRAINT `log_foreign_key` FOREIGN KEY (`unit_id`) REFERENCES `users` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `markers`
--
ALTER TABLE `markers`
ADD CONSTRAINT `disease_foreign_key` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`disease_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_table_status`
--
ALTER TABLE `user_table_status`
ADD CONSTRAINT `user_table_status_foreign_key` FOREIGN KEY (`unit_id`) REFERENCES `users` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

