<?php
// 1. Force PHP to display errors clearly on the screen
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. Include your database connection
require 'db.php';

// 3. Test a hardcoded value to see what crashes
$filiere = "YOUR_TEST_VALUE_HERE"; // Put a real filiere name here

try {
    echo "Testing database connection... <br>";
    if  (!isset($data_b)) { echo "Error: \$data_b variable is not defined!<br>"; }

    echo "Testing Formateurs query... <br>";
    $search_term = '"' . $filiere . '"';
    $select_formateurs = $data_b->prepare("SELECT * FROM formateurs WHERE JSON_CONTAINS(his_filiere, ?)");
    $select_formateurs->execute([$search_term]);
    $row_formateurs = $select_formateurs->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Success! Formateurs found: " . count($row_formateurs) . "<br>";

} catch (Exception $e) {
    echo "<br><strong>Caught PHP Error:</strong> " . $e->getMessage();
}
?>