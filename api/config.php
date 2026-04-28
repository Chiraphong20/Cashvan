<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost'; // Usually PHP and MySQL are on the same machine
$db   = 'cashvan_db';
$user = 'root';
$pass = 'megroup@72147321';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERR_MODE            => PDO::ERR_MODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
     exit();
}

// Global helper for JSON response
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
?>
