<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendResponse(["status" => "error", "message" => "Method not allowed"], 405);
}

try {
    // 1. Total Stores vs Visited today
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM stores");
    $totalStores = $stmt->fetch()['total'];

    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT store_id) as visited FROM visits WHERE DATE(visited_at) = CURDATE()");
    $stmt->execute();
    $visitedToday = $stmt->fetch()['visited'];

    // 2. Timeline of activity (Last 10 visits)
    $stmt = $pdo->query("SELECT v.*, s.name as store_name, d.name as driver_name 
                         FROM visits v 
                         JOIN stores s ON v.store_id = s.id 
                         JOIN drivers d ON v.driver_id = d.id 
                         ORDER BY v.visited_at DESC LIMIT 10");
    $timeline = $stmt->fetchAll();

    // 3. Stats by Store Type
    $stmt = $pdo->query("SELECT type, COUNT(*) as count FROM stores GROUP BY type");
    $byType = $stmt->fetchAll();

    sendResponse([
        "total_stores" => $totalStores,
        "visited_today" => $visitedToday,
        "timeline" => $timeline,
        "by_type" => $byType
    ]);
} catch (Exception $e) {
    sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
