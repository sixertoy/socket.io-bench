-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Client: localhost
-- Généré le: Dim 16 Novembre 2014 à 13:26
-- Version du serveur: 5.6.12-log
-- Version de PHP: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données: `socketio`
--
CREATE DATABASE IF NOT EXISTS `socketio` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `socketio`;

-- --------------------------------------------------------

--
-- Structure de la table `empty`
--

CREATE TABLE IF NOT EXISTS `empty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(11) NOT NULL,
  `id_object` int(11) NOT NULL,
  `setting` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `picture`
--

CREATE TABLE IF NOT EXISTS `picture` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `legend` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `date_create` datetime NOT NULL,
  `date_update` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=4 ;

--
-- Contenu de la table `picture`
--

INSERT INTO `picture` (`id`, `path`, `name`, `legend`, `date_create`, `date_update`) VALUES
(1, '/uploaded_files/pictures/img9.jpg', 'img9.jpg', 'img9.jpg', '2014-10-22 12:17:26', '2014-10-22 12:17:26'),
(2, '/uploaded_files/pictures/img3-v2.jpg', 'img3-v2.jpg', 'img3-v2.jpg', '2014-10-22 12:17:37', '2014-10-22 12:17:37'),
(3, '/uploaded_files/pictures/img1.jpg', 'img1.jpg', 'img1.jpg', '2014-10-22 12:18:01', '2014-10-22 12:18:01');

-- --------------------------------------------------------

--
-- Structure de la table `watch`
--

CREATE TABLE IF NOT EXISTS `watch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(11) NOT NULL,
  `id_object` int(11) NOT NULL,
  `setting` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Contenu de la table `watch`
--

INSERT INTO `watch` (`id`, `name`, `id_object`, `setting`) VALUES
(1, 'video', 12, '{"json":{"name":"entry","content":"yo"}}'),
(2, 'silhouette', 2, '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
