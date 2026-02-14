<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require "db.php";

// 1. Select the latest row
$select_planning = $data_b->prepare("SELECT * FROM planning ORDER BY id DESC LIMIT 1");
$select_planning->execute();

// 2. Use fetch() instead of fetchAll() because we only want one result
$row = $select_planning->fetch(PDO::FETCH_ASSOC);

if ($row) {
    // 3. Decode the 'data' column from String -> Object
    $row['data'] = json_decode($row['data']);
    
    // 4. Send the clean object
    echo json_encode($row);
} else {
    echo json_encode(null); // Return null if table is empty
}
?>