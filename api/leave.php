<?php


    //********************Get Barcode functionality*****************//
    $app->get('/getLeave', function() use ($app){
        $db = new DbHandler();
        if (!isset($_SESSION)) {
            session_start();
        }
        $uid =  $_SESSION['uid'];
        $data = $db->getData(" SELECT empd.vacation_leave, empd.sick_leave FROM employees emp
        LEFT JOIN employee_details empd on empd.employee_type = emp.employee_type
        WHERE emp.id = $uid");
        echo json_encode($data);
    });

    

?>