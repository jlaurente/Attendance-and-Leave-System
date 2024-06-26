<?php
	//********************Get Schedule functionality*****************//
	$app->get('/getSchedule', function() use ($app){
		$db = new DbHandler();
	    $data = $db->getData(" SELECT * FROM schedules ");
    	echo json_encode($data);
	});

	//********************Add Overtime functionality*****************//
    $app->post('/addSchedule', function() use ($app){
        $postdata = file_get_contents("php://input");
        $r = json_decode($postdata);
        $response = array();
        $db = new DbHandler();
        $start_time = $r->start_time;
        $end_time = $r->end_time;

        $date = date('Y-m-d');  
        if (!isset($_SESSION)) {
            session_start();
        }
        $user_id =  $_SESSION['uid'];
        
        $isOtDateExists = $db->getOneRecord("SELECT * FROM schedules 
        WHERE time_in = '".$start_time."' and time_out = '".$end_time."' ");
        if(!$isOtDateExists){

            $db->insertRecord(" INSERT INTO schedules(time_in, time_out)
            VALUES('$start_time', '$end_time') ");

            $response["status"] = "success";
            $response["message"] = "Schedule created successfully";
            echoResponse(200, $response);
                     
        }else{
            $response["status"] = "error";
            $response["message"] = "An schedule date provided exists!";
            echoResponse(201, $response);
        }
    });
?>