<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require "db.php"; 

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received"]);
    exit;
}

try {
    $data_b->beginTransaction();
    $records_inserted = 0;

    // 1. INSERT GROUPES
    $stmt_groupe = $data_b->prepare("INSERT INTO groupes (nom, niveau, filiere) VALUES (?, ?, ?)");
    foreach ($data['groupes'] as $g) {
        $stmt_groupe->execute([$g['nom'], $g['niveau'], $g['filiere']]);
        $records_inserted += $stmt_groupe->rowCount();
    }

    // 2. INSERT MODULES
    $stmt_module = $data_b->prepare("INSERT INTO modules (nom, filiere, heures_totales, type) VALUES (?, ?, ?, ?)");
    foreach ($data['modules'] as $m) {
        $stmt_module->execute([$m['nom'], $m['filiere'], $m['heures_totale'], $m['type']]);
        $records_inserted += $stmt_module->rowCount();
    }

    // 3. INSERT FORMATEURS (NOW SAVING MODULES, GROUPS, AND FILIERES)
    $stmt_formateur = $data_b->prepare("INSERT INTO formateurs (nom, his_module, his_group, his_filiere, max_heures) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($data['formateurs'] as $f) {
        // Encode all three arrays into JSON strings
        $modules_json = json_encode($f['his_module'], JSON_UNESCAPED_UNICODE); 
        $groups_json = json_encode($f['his_group'], JSON_UNESCAPED_UNICODE); 
        $filieres_json = json_encode($f['his_filiere'], JSON_UNESCAPED_UNICODE); 
        
        $stmt_formateur->execute([
            $f['nom'], 
            $modules_json, 
            $groups_json,
            $filieres_json,
            $f['max_heures']
        ]);
        $records_inserted += $stmt_formateur->rowCount();
    }

    $data_b->commit();
    echo json_encode(["status" => "success", "inserted" => $records_inserted]);

} catch (Exception $e) {
    $data_b->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>