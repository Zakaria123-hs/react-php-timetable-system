<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Added OPTIONS
header("Access-Control-Allow-Headers: Content-Type");

// Handle Browser Pre-flight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';

$json = file_get_contents("php://input");
$data = json_decode($json, true);

// Make sure filiere was actually sent
if (!isset($data['filiere'])) {
    echo json_encode(["error" => "No filiere provided"]);
    exit;
}

try {
    $filiere = $data['filiere'];

    // 1. FORMATEURS (Needs special '"..."' format for JSON_CONTAINS)
    $search_term = '"' . $filiere . '"';
    $select_formateurs = $data_b->prepare("SELECT * FROM formateurs WHERE JSON_CONTAINS(his_filiere, ?)");
    $select_formateurs->execute([$search_term]); // Must be an array
    $row_formateurs = $select_formateurs->fetchAll(PDO::FETCH_ASSOC);

    // 2. MODULES
    $select_modules = $data_b->prepare("SELECT * FROM modules WHERE filiere = ?");
    $select_modules->execute([$filiere]); // Added missing brackets []
    $row_modules = $select_modules->fetchAll(PDO::FETCH_ASSOC);

    // 3. GROUPES
    $select_groupes = $data_b->prepare("SELECT * FROM groupes WHERE filiere = ?");
    $select_groupes->execute([$filiere]); // Added missing brackets []
    $row_groupes = $select_groupes->fetchAll(PDO::FETCH_ASSOC);

    // 4. SALLES
    $select_salle = $data_b->prepare("SELECT * FROM salle");
    $select_salle->execute();
    $row_salle = $select_salle->fetchAll(PDO::FETCH_ASSOC);

    // Combine all data
    $all_information = [
        "formateurs" => $row_formateurs,
        "modules" => $row_modules,
        "groupes" => $row_groupes,
        "salles" => $row_salle,
        "filiere" => $filiere
    ];

    // send JSON to React
    echo json_encode($all_information);

} catch (Exception $e) {
    // If anything fails, send a clean JSON error instead of breaking React
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>