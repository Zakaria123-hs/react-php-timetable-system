<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // allow React on another port
require 'db.php';


$select_formateurs = $data_b->prepare("SELECT * FROM formateurs");
$select_formateurs->execute();
$row_formateurs = $select_formateurs->fetchAll(PDO::FETCH_ASSOC);

$select_modules = $data_b->prepare("SELECT * FROM modules");
$select_modules->execute();
$row_modules = $select_modules->fetchAll(PDO::FETCH_ASSOC);

$select_groupes = $data_b->prepare("SELECT * FROM groupes");
$select_groupes->execute();
$row_groupes = $select_groupes->fetchAll(PDO::FETCH_ASSOC);

$select_salle = $data_b->prepare("SELECT * FROM salle");
$select_salle->execute();
$row_salle = $select_salle->fetchAll(PDO::FETCH_ASSOC);

// combine all data
$all_information = [
    "formateurs" => $row_formateurs,
    "modules" => $row_modules,
    "groupes" => $row_groupes,
    "salles" => $row_salle
];

// send JSON to React
echo json_encode($all_information);


