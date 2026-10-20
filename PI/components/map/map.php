<?php
session_start();
header('Content-Type: application/javascript');
 
$username = $_SESSION['username'] ?? 'Guest';
$password = $_SESSION['password'] ?? '';
/**********************/

$dir = '../../json-map-images/';

$raw = scandir($dir);

if ($raw === false) {
	die("Error: Could not scan directory '$dir'.");
}

$jsonFiles = array_diff($raw, array('.', '..'));

$jsonFiles = array_values($jsonFiles);

$_SESSION['articles'] = $jsonFiles;

$jsonFiles_to_js = json_encode($jsonFiles)
?>

