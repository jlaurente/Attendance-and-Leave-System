<?php

    //********************Get Overtime functionality*****************//
    $app->get('/getOvertime', function() use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $role =  $_SESSION['role'];
        if($role == 1){
            $data = $db->getData(" SELECT ot.id, ot.date_filed, ot.effectivity_date, ot.time_in, 
            ot.time_out, ot.reason, ot.total_ot_hrs,ot.status, 
            emp.firstname, emp.mname, emp.lastname
            FROM overtimes ot LEFT JOIN employees emp ON emp.id = ot.user_id 
            WHERE ot.status = 0 ");
        }else{
            $data = $db->getData(" SELECT id, date_filed, effectivity_date, time_in, time_out, reason, total_ot_hrs,status
            FROM overtimes WHERE user_id = $uid");
        }
        
        echo json_encode($data);
    });

    //********************Get Approve OT functionality*****************//
    $app->get('/getApproveOt', function() use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $data = $db->getData(" SELECT ot.id, ot.date_approved, ot.effectivity_date, ot.time_in, 
        ot.time_out, ot.reason, ot.total_ot_hrs,ot.status,
        emp.firstname, emp.mname, emp.lastname, ad.role_name
        FROM overtimes ot 
        LEFT JOIN employees emp ON emp.id = ot.user_id 
        LEFT JOIN usertype ad ON ad.role_id = ot.approved_by
        WHERE ot.status = 1 ");
        echo json_encode($data);
    });

    //********************Get Approve OT functionality*****************//
    $app->get('/getdisApproveOt', function() use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $data = $db->getData(" SELECT ot.id, ot.date_approved, ot.effectivity_date, ot.time_in, 
        ot.time_out, ot.reason, ot.total_ot_hrs,ot.status,
        emp.firstname, emp.mname, emp.lastname, ad.role_name
        FROM overtimes ot 
        LEFT JOIN employees emp ON emp.id = ot.user_id 
        LEFT JOIN usertype ad ON ad.role_id = ot.approved_by
        WHERE ot.status = 2 ");
        echo json_encode($data);
    });

    //********************Add Overtime functionality*****************//
    $app->post('/addOvertime', function() use ($app){
        $postdata = file_get_contents("php://input");
        $r = json_decode($postdata);
        $response = array();
        $db = new DbHandler();
        $reason = $r->reason;
        $ot_date = $r->ot_date;
        $start_time = $r->start_time;
        $end_time = $r->end_time;
        $start = new DateTime(trim($start_time));
        $end = new DateTime(trim($end_time));
        $hrs = $start->diff($end)->format('%h.%i');

        $date = date('Y-m-d');  
        if (!isset($_SESSION)) {
            session_start();
        }
        $user_id =  $_SESSION['uid'];
        
        $isOtDateExists = $db->getOneRecord("SELECT * FROM overtimes 
        WHERE effectivity_date = '".$ot_date."' ");
        if(!$isOtDateExists){

            $db->insertRecord(" INSERT INTO overtimes(time_in, time_out, total_ot_hrs, effectivity_date, reason, dept_id, user_id, date_filed)
            VALUES('$start_time', '$end_time', '$hrs', '$ot_date', '$reason', '1', '$user_id', '$date') ");

            $response["status"] = "success";
            $response["message"] = "Overtime created successfully";
            echoResponse(200, $response);
                     
        }else{
            $response["status"] = "error";
            $response["message"] = "An overtime date provided exists!";
            echoResponse(201, $response);
        }
    });

    //********************Get get id functionality*****************//
    $app->get('/editOvertime/:id', function($id) use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $date = date('Y-m-d');  
        $data = $db->getData(" SELECT id, date_filed, effectivity_date, time_in, time_out, reason, total_ot_hrs,status
            FROM overtimes WHERE user_id = $uid and id = $id ");
        echo json_encode($data);
    });

    $app->put('/updateOvertime', function() use ($app){
        $postdata = file_get_contents("php://input");
        $r = json_decode($postdata);
        $response = array();
        $db = new DbHandler();
        $reason = $r->reason;
        $ot_date = $r->ot_date;
        $id = $r->id;
        $start_time = $r->start_time;
        $end_time = $r->end_time;
        $start = new DateTime(trim($start_time));
        $end = new DateTime(trim($end_time));
        $hrs = $start->diff($end)->format('%h.%i');
        $date = date('Y-m-d');  
        if (!isset($_SESSION)) { session_start(); }
        $uid =  $_SESSION['uid'];

        $stmt = $db->conn->prepare("UPDATE overtimes 
        SET effectivity_date='$ot_date',time_in='$start_time',time_out='$end_time',
        total_ot_hrs='$hrs',reason='$reason',date_updated='$date',updated_by='$uid'
        WHERE id='$id'");
        $result = $stmt->execute();

        if($result != NULL) { 
            $response["status"] = "success";
            $response["message"] = "Updated successfully";
            echoResponse(200, $response);
        }else{
            $response["status"] = "error";
            $response["message"] = "Failed to update overtime. Please try again";
            echoResponse(201, $response);
        }
    });

    $app->get('/deleteOvertime/:id', function($id) use ($app){
        $db = new DbHandler();
        $result = $db->deleteRecord(" DELETE FROM overtimes where id = '$id' ");
        if($result != NULL){ 
            $response["status"] = "success";
            $response["message"] = "Overtime deleted successfully";
            echoResponse(200, $response);
        }else{
            $response["status"] = "error";
            $response["message"] = "Failed to delete overtime. Please try again";
            echoResponse(201, $response);
        }
    });

     //********************Get get id functionality*****************//
    $app->get('/approveOT/:id', function($id) use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $date = date('Y-m-d');

        $stmt = $db->conn->prepare("UPDATE overtimes SET status = 1, date_approved = '$date', 
        approved_by = '$uid' WHERE id = '$id'");
         $result = $stmt->execute();

        if($result != NULL) { 
            $response["status"] = "success";
            $response["message"] = "Approved overtime successfully";
            echoResponse(200, $response);
        }else{
            $response["status"] = "error";
            $response["message"] = "Failed to approve overtime. Please try again";
            echoResponse(201, $response);
        }
    });

    //********************Get get id functionality*****************//
    $app->get('/disapprovedOT/:id', function($id) use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $date = date('Y-m-d');

        $stmt = $db->conn->prepare("UPDATE overtimes SET status = 2, date_approved = '$date', 
        approved_by = '$uid' WHERE id = '$id'");
         $result = $stmt->execute();

        if($result != NULL) { 
            $response["status"] = "success";
            $response["message"] = "Disapproved overtime successfully";
            echoResponse(200, $response);
        }else{
            $response["status"] = "error";
            $response["message"] = "Failed to approve overtime. Please try again";
            echoResponse(201, $response);
        }
    });

?>