<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require "db.php";

$select_planning = $data_b->prepare("SELECT * FROM planning ORDER BY id DESC LIMIT 1");
$select_planning->execute();
$row = $select_planning->fetch(PDO::FETCH_ASSOC);

if ($row) {
    // Decode the JSON string so React receives an Object, not a String
    $row['data'] = json_decode($row['data']);
    echo json_encode($row);
} else {
    echo json_encode(null);
}
?>