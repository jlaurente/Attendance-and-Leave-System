<?php

class dbConnect {

    private $conn;

    function __construct() {        
    }

    /**
     * Establishing database connection
     * @return database connection handler
     */
    function connect() {
        $dbuser = "root";
        $dbpass = "";
        $dsn = "mysql:host = localhost;dbname=attendance;charset=utf8mb4";
        $this->conn = new PDO($dsn, $dbuser, $dbpass);
      

        // returing connection resource
        return $this->conn;
    }

}

?>
