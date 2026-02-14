<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require "db.php"; 

$json = file_get_contents("php://input");
$payload = json_decode($json, true);

// We expect two things: the 'planning' data AND the 'mode'
$planning = $payload['planning'] ?? null;
$mode = $payload['mode'] ?? 'create'; // Default to create if missing

if (!$planning) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

try {
    $data_b->beginTransaction();

    // =========================================================
    // MODE 1: CREATE (First Save) - JUST REDUCE
    // =========================================================
    if ($mode === 'create') {
        // 1. Just Calculate and Subtract
        $stats = calculateModuleHours($planning);
        $update_sub = $data_b->prepare("UPDATE modules SET heures_totales = heures_totales - ? WHERE nom = ?");
        
        foreach ($stats as $name => $count) {
            $update_sub->execute([$count * 2.5, $name]);
        }

        // 2. Insert new row
        $stmt = $data_b->prepare("INSERT INTO planning (data) VALUES (?)");
        $stmt->execute([json_encode($planning)]);
    } 

    // =========================================================
    // MODE 2: UPDATE (Correction) - REFUND THEN REDUCE
    // =========================================================
    else {
  £      // 1. Get the Old Data to Refund it
        $stmt = $data_b->prepare("SELECT id, data FROM planning ORDER BY id DESC LIMIT 1");
        $stmt->execute();
        $old_row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($old_row) {
            $old_planning = json_decode($old_row['data'], true);
            
            // A. Refund Old Hours
            $old_stats = calculateModuleHours($old_planning);
            $update_add = $data_b->prepare("UPDATE modules SET heures_totales = heures_totales + ? WHERE nom = ?");
            foreach ($old_stats as $name => $count) {
                $update_add->execute([$count * 2.5, $name]);
            }

            // B. Subtract New Hours
            $new_stats = calculateModuleHours($planning);
            $update_sub = $data_b->prepare("UPDATE modules SET heures_totales = heures_totales - ? WHERE nom = ?");
            foreach ($new_stats as $name => $count) {
                $update_sub->execute([$count * 2.5, $name]);
            }

            // C. Update the Database Row
            $save_stmt = $data_b->prepare("UPDATE planning SET data = ? WHERE id = ?");
            $save_stmt->execute([json_encode($planning), $old_row['id']]);
        } else {
            // Safety fallback: If user clicked 'Update' but DB is empty, treat as Create
            throw new Exception("Cannot update: Database is empty.");
        }
    }

    $data_b->commit();
    echo json_encode(["status" => "success", "mode_executed" => $mode]);

} catch (Exception $e) {
    $data_b->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

function calculateModuleHours($planning_data) {
    $stats = [];
    if (!is_array($planning_data)) return $stats;
    foreach($planning_data as $grp) {
        if (!is_array($grp)) continue;
        foreach($grp as $day) {
            if (!is_array($day)) continue;
            foreach($day as $slot) {
                if (isset($slot['module']) && !empty($slot['module'])) {
                    $name = $slot['module'];
                    if (!isset($stats[$name])) $stats[$name] = 0;
                    $stats[$name]++;
                }
            }
        }
    }
    return $stats;
}
?>