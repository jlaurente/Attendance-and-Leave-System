<?php
	$app->get('/getCntEmployees', function() use ($app){
    $db = new DbHandler();
    $employees = $db->getData("SELECT count(*) as CNT from employees order by id");
    echo json_encode($employees);
  });

  $app->get('/getCntAttendance', function() use ($app){
    $db = new DbHandler();
    if (!isset($_SESSION)) { session_start(); }
    $uid =  $_SESSION['uid'];
    $role = $_SESSION['role'];
    if($role==1){
      $attendance = $db->getData("SELECT count(*) as CNT from attendance order by id");
    }else{
      $attendance = $db->getData("SELECT count(*) as CNT from attendance WHERE employee_id = '".$uid."' order by id");
    }
    echo json_encode($attendance);
  });

  $app->get('/getCntItems', function() use ($app){
     $db = new DbHandler();
      $user = $db->getData("select count(*) as CNT from items order by id");
      echo json_encode($user);
  });
	
?>