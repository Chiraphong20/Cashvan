<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['store_id'])) {
            $stmt = $pdo->prepare("SELECT * FROM visits WHERE store_id = ? ORDER BY visited_at DESC");
            $stmt->execute([$_GET['store_id']]);
            sendResponse($stmt->fetchAll());
        } else {
            $stmt = $pdo->prepare("SELECT v.*, s.name as store_name FROM visits v JOIN stores s ON v.store_id = s.id ORDER BY v.visited_at DESC");
            $stmt->execute();
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) sendResponse(["status" => "error", "message" => "Invalid data"], 400);

        try {
            $stmt = $pdo->prepare("INSERT INTO visits (store_id, driver_id, status, notes, photo_urls, accuracy) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['store_id'],
                $data['driver_id'],
                $data['status'] ?? 'SUCCESS',
                $data['notes'] ?? '',
                json_encode($data['photo_urls'] ?? []),
                $data['accuracy'] ?? null
            ]);
            
            // Update store last_visited_at logic if needed, or status
            if (isset($data['update_store_status'])) {
                $stmt = $pdo->prepare("UPDATE stores SET status = ? WHERE id = ?");
                $stmt->execute([$data['update_store_status'], $data['store_id']]);
            }

            sendResponse(["status" => "success"]);
        } catch (Exception $e) {
            sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
        }
        break;

    default:
        sendResponse(["status" => "error", "message" => "Method not allowed"], 405);
}
?>
