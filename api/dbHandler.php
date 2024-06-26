<?php

class DbHandler {

    public $conn;

    function __construct() {
       require_once 'dbConnect.php';
        // opening db connection
        $db = new dbConnect();
        $this->conn = $db->connect();
    }
   /**
     * Fetching single record
     */
    public function getOneRecord($query) {
        $sql_stmt = $this->conn->prepare($query);
        $sql_stmt->execute();
        $result = $sql_stmt->fetch(PDO::FETCH_ASSOC);
        return $result;    
    }
    /**
     * Creating new record
     */
    public function insertIntoTable($obj, $column_names, $table_name) {
        
        $c = (array) $obj;
        $keys = array_keys($c);
        $columns = '';
        $values = '';
        foreach($column_names as $desired_key){ // Check the obj received. If blank insert blank into the array.
           if(!in_array($desired_key, $keys)) {
                $$desired_key = '';
            }else{
                $$desired_key = $c[$desired_key];
            }
            $columns = $columns.$desired_key.',';
            $values = $values."'".$$desired_key."',";
        }
        $query = "INSERT INTO ".$table_name."(".trim($columns,',').") VALUES(".trim($values,',').")";
        $sql_stmt = $this->conn->prepare($query);

        try {
            $result = $sql_stmt->execute();
        } catch (PDOException $e) {
            trigger_error('Error occured while trying to insert into the DB:' . $e->getMessage(), E_USER_ERROR);
        }
        if ($result) {
            return $sql_stmt->rowCount();
        }
    }   

    /**
     * Fetching single record
     */
    public function getCountRecord($query) {
         $sql_stmt = $this->conn->prepare($query);
            $sql_stmt->execute();
            $result = $sql_stmt->fetch(PDO::FETCH_ASSOC);
            return $result;     
    }
    
    /**
     * Inserting record
     */
    public function insertRecord($query) {
       $sql_stmt = $this->conn->prepare($query);
        $sql_stmt->execute();
    }

     /**
     * Updating record
     */
    public function updateRecord($query) {
       $sql_stmt = $this->conn->prepare($query);
        $sql_stmt->execute();
    }

    /**
     * Deleting record
     */
    public function deleteRecord($query) {
           $sql_stmt = $this->conn->prepare($query);
           $result = $sql_stmt->execute();
           return $result;
        }
    
    /**
     * Get all record
     */
    public function getData($query) {
        $sql_stmt = $this->conn->prepare($query);
        $sql_stmt->execute();
        $result = $sql_stmt->fetchAll();
        $sql_stmt = null;
        return $result;    
    }
    
    
    /**
     * Get session
     */
    public function getSession(){
        if (!isset($_SESSION)) {
            session_start();
        }
        $sess = array();
        if(isset($_SESSION['uid']))
        {
            $sess["uid"] = $_SESSION['uid'];
            $sess["role"] = $_SESSION['role'];
            $sess["usertype_name"] = $_SESSION['usertype_name'];
            $sess["name"] = $_SESSION['name'];
        }
        else
        {
            $sess["uid"] = '';
            $sess["role"] = 'Guest';
            $sess["usertype_name"] = '';
            $sess["name"] ='';
        }
        return $sess;
    }
    /**
     * Destroy session
     */
    public function destroySession(){
        if (!isset($_SESSION)) {
        session_start();
        }
        if(isSet($_SESSION['uid']))
        {
            unset($_SESSION['uid']);
            unset($_SESSION['role']);
            unset($_SESSION['usertype_name']);
            unset($_SESSION['name']);
            $info='info';
            if(isSet($_COOKIE[$info]))
            {
                setcookie ($info, '', time() - $cookie_time);
            }
            $msg="Logged Out Successfully...";
        }
        else
        {
            $msg = "Not logged in...";
        }
        return $msg;
    }
 
}

?>
