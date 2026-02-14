<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require "db.php";

// 1. Get the POST data
$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Missing email or password"]);
    exit;
}

$email = $data['email'];
$password = $data['password'];

try {
    // 2. Securely check database
    // Note: In production, passwords should be hashed (e.g., password_verify). 
    // For now, we check plain text as requested.
    $stmt = $data_b->prepare("SELECT id, email, type FROM users WHERE email = ? AND password = ?");
    $stmt->execute([$email, $password]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Success: Return user info (excluding password)
        echo json_encode([
            "status" => "success",
            "user" => $user
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid email or password"
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Server Error"]);
}
?>