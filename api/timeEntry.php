<?php
	//********************Get Attendance functionality*****************//
	$app->get('/getAttendance', function() use ($app){
		$db = new DbHandler();
		if (!isset($_SESSION)) {
	        session_start();
	    }
	    $uid =  $_SESSION['uid'];
	    $role = $_SESSION['role'];
	    if($role==1){
	    	$data = $db->getData(" SELECT *, employees.employee_id AS empid, attendance.id AS attid FROM attendance LEFT JOIN employees ON employees.id=attendance.employee_id ORDER BY attendance.date DESC, attendance.time_in DESC ");
	    }else{
	    	$data = $db->getData(" SELECT *, employees.employee_id AS empid, attendance.id AS attid FROM attendance 
	    	LEFT JOIN employees ON employees.id=attendance.employee_id 
	    	WHERE employees.id = '".$uid."'
	    	ORDER BY attendance.date DESC, attendance.time_in DESC ");
	    }
    	echo json_encode($data);
	    
	});

    //********************Add Items functionality*****************//
	$app->post('/addTimeEntry', function() use ($app){
		$postdata = file_get_contents("php://input");
	    $r = json_decode($postdata);
	    verifyRequiredParams(array('time_entry','emp_id',),$r->employee);
	    $response = array();
	    $db = new DbHandler();
	    $time_entry = $r->employee->time_entry;
	    $emp_id = $r->employee->emp_id;
	  
	    $row = $db->getOneRecord("SELECT * FROM employees WHERE employee_id ='$emp_id'");
        if($row){
        	$id = $row['id'];

        	$date_now = date('Y-m-d');

			if($time_entry == 'in'){
				$checking = $db->getOneRecord("SELECT * FROM attendance WHERE employee_id = '$id' AND date = '$date_now' AND time_in IS NOT NULL");
				if($checking){
					$response["status"] = "error";
		            $response["message"] = "You have timed in for today";
		            echoResponse(201, $response);
				}else{
					//updates
					$sched = $row['schedule_id'];
					$lognow = date('H:i:s');
					$srow = $db->getOneRecord("SELECT * FROM schedules WHERE id = '$sched'");
					$logstatus = ($lognow > $srow['time_in']) ? 0 : 1;

					$result = $db->insertRecord(" INSERT INTO attendance (employee_id, date, time_in, status) 
					VALUES ('$id', '$date_now', NOW(), '$logstatus') ");

			        $response["status"] = "success";
			        $response["message"] = "Time in: ".$row['firstname']." ".$row['lastname'];
			        echoResponse(200, $response);
				}
			}else{
				$sql = $db->getOneRecord("SELECT *, attendance.id AS uid FROM attendance LEFT JOIN employees ON employees.id=attendance.employee_id WHERE attendance.employee_id = '$id' AND attendance.date = '$date_now'");


				if(!$sql){
				 	$response["status"] = "error";
		            $response["message"] = "Cannot Timeout. No time in.";
		            echoResponse(201, $response);
				}else{
					if($sql['time_out'] != '00:00:00'){
					 	$response["status"] = "error";
			            $response["message"] = "You have timed out for today";
			            echoResponse(201, $response);
					}
					else{
						$stmt = $db->conn->prepare(" UPDATE attendance SET time_out = NOW() WHERE id = '".$sql['uid']."' ");
					    $result = $stmt->execute();
					    if($result != NULL){ 

					        $urow = $db->getOneRecord("SELECT * FROM attendance WHERE id = '".$sql['uid']."'");

							$time_in = $urow['time_in'];
							$time_out = $urow['time_out'];

							$srow = $db->getOneRecord("SELECT * FROM employees LEFT JOIN schedules ON schedules.id=employees.schedule_id WHERE employees.id = '$id'");

							if($srow['time_in'] > $urow['time_in']){
								$time_in = $srow['time_in'];
							}

							if($srow['time_out'] < $urow['time_in']){
								$time_out = $srow['time_out'];
							}

							$time_in = new DateTime($time_in);
							$time_out = new DateTime($time_out);
							$interval = $time_in->diff($time_out);
							$hrs = $interval->format('%h');
							$mins = $interval->format('%i');
							$mins = $mins/60;
							$int = $hrs + $mins;
							if($int > 4){
								$int = $int - 1;
							}

							$stmt = $db->conn->prepare(" UPDATE attendance SET num_hr = '$int' WHERE id = '".$sql['uid']."' ");
					    	$result = $stmt->execute();

					    	if($result != NULL){ 
						        $response["status"] = "info";
						        $response["message"] = 'Time out: '.$sql['firstname'].' '.$sql['lastname'];
						        echoResponse(200, $response);
						    }else{
						        $response["status"] = "error";
						        $response["message"] = "Failed to update charge. Please try again";
						        echoResponse(201, $response);
						    }
					    }else{
					        $response["status"] = "error";
					        $response["message"] = "Failed to update charge. Please try again";
					        echoResponse(201, $response);
					    }

						
					}	
				}
			}      
        }else{
            $response["status"] = "error";
            $response["message"] = "Employee ID not found";
            echoResponse(201, $response);
        }
	    
	});

?>