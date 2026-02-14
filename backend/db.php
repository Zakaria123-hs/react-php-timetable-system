<?php
$data_b = new PDO("mysql:host=localhost; dbname=time_table; port=8080", "root", "");
$data_b->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);