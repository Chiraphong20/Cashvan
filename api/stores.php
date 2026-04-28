<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['get_zones'])) {
            $stmt = $pdo->query("SELECT * FROM zones ORDER BY name_th ASC");
            sendResponse($stmt->fetchAll());
        } elseif (isset($_GET['id'])) {
            // Get single store
            $stmt = $pdo->prepare("SELECT * FROM stores WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            sendResponse($stmt->fetch());
        } else {
            // Get all stores with district info
            $query = "SELECT s.*, z.name_th as sub_district_name 
                      FROM stores s 
                      LEFT JOIN zones z ON s.sub_district_id = z.id";
            
            // Add filters
            $params = [];
            if (isset($_GET['sub_district_id']) && $_GET['sub_district_id'] != '0') {
                $query .= " WHERE s.sub_district_id = ?";
                $params[] = $_GET['sub_district_id'];
            }
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) sendResponse(["status" => "error", "message" => "Invalid data"], 400);

        try {
            $stmt = $pdo->prepare("INSERT INTO stores (id, name, address, lat, lng, type, status, sub_district_id, created_by) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['id'] ?? uniqid('st_'),
                $data['name'],
                $data['address'] ?? '',
                $data['lat'],
                $data['lng'],
                $data['type'] ?? 'grocery',
                $data['status'] ?? 'PROSPECT',
                $data['sub_district_id'] ?? null,
                $data['created_by'] ?? null
            ]);
            sendResponse(["status" => "success", "id" => $data['id']]);
        } catch (Exception $e) {
            sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) sendResponse(["status" => "error", "message" => "ID required"], 400);

        $fields = [];
        $params = [];
        foreach (['name', 'address', 'status', 'type'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        $params[] = $data['id'];

        if (empty($fields)) sendResponse(["status" => "error", "message" => "No fields to update"], 400);

        $sql = "UPDATE stores SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        sendResponse(["status" => "success"]);
        break;

    default:
        sendResponse(["status" => "error", "message" => "Method not allowed"], 405);
}
?>
