<?php
require_once 'config.php';

// This script populates the zones table from korat_zones.json
$jsonFile = __DIR__ . '/../korat_zones.json';
if (!file_exists($jsonFile)) {
    sendResponse(["status" => "error", "message" => "JSON file not found"], 404);
}

$data = json_decode(file_get_contents($jsonFile), true);

try {
    $pdo->beginTransaction();
    
    // Clear existing
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE zones");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // Insert Districts
    $stmt = $pdo->prepare("INSERT INTO zones (id, name_th, parent_id, type) VALUES (?, ?, ?, 'DISTRICT')");
    foreach ($data['districts'] as $d) {
        $stmt->execute([$d['id'], $d['name_th'], $d['parent_id']]);
    }

    // Insert Sub-Districts
    $stmt = $pdo->prepare("INSERT INTO zones (id, name_th, parent_id, type) VALUES (?, ?, ?, 'SUB_DISTRICT')");
    foreach ($data['subDistricts'] as $sd) {
        $stmt->execute([$sd['id'], $sd['name_th'], $sd['parent_id']]);
    }

    $pdo->commit();
    sendResponse(["status" => "success", "message" => "Zones initialized"]);
} catch (Exception $e) {
    $pdo->rollBack();
    sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
}
?>
