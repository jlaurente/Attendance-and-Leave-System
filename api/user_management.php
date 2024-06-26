<?php

	//********************Get Role functionality*****************//
	$app->get('/getRole', function() use ($app){
		$db = new DbHandler();
	    $data = $db->getData(" SELECT * FROM usertype ");
    	echo json_encode($data);
	});

	//********************Get Position functionality*****************//
	$app->get('/getPosition', function() use ($app){
		$db = new DbHandler();
	    $data = $db->getData(" SELECT * FROM position ");
    	echo json_encode($data);
	});

	//********************Get EmpDetails functionality*****************//
	$app->get('/getEmpDetails', function() use ($app){
		$db = new DbHandler();
	    $data = $db->getData(" SELECT * FROM employee_details ");
    	echo json_encode($data);
	});

	//********************login functionality*****************//
    $app->post('/login', function() use ($app) {
        $r = json_decode($app->request->getBody());
        verifyRequiredParams(array('username', 'password'),$r->customer);
        $response = array();
        $db = new DbHandler();
        $password = $r->customer->password;
        $username = $r->customer->username;
        $user = $db->getOneRecord(" SELECT admin.id,admin.role,usertype.role_name, admin.password, 
        emp.employee_id, emp.firstname, emp.lastname FROM admin
        LEFT JOIN employees emp ON admin.role = emp.role_id
        LEFT JOIN usertype ON admin.role = usertype.role_id
        WHERE admin.username = '".$username."' ");
        if ($user != NULL) {
            if($user['password']==$password){
                $response['status'] = "success";
                $response['message'] = 'Logged in successfully.';
                $response['role'] = $user['role'];
                $response['uid'] = $user['id'];
                $response['name'] = $user['firstname'].' '.$user['lastname'];
                $response['usertype_name'] = $user['role_name'];
                if (!isset($_SESSION)) {
                    session_start();
                }
                $_SESSION['uid'] = $user['id'];
                $_SESSION['usertype_name'] = $user['role_name'];
                $_SESSION['name'] = $user['firstname'].' '.$user['lastname'];
                $_SESSION['role'] = $user['role'];
            } else {
                $response['status'] = "error";
                $response['message'] = 'Login failed. Incorrect credentials';
            }
        }else {
                $response['status'] = "error";
                $response['message'] = 'No such user is registered';
            }
        echoResponse(200, $response);
        
    });

    //********************Get Users functionality*****************//
	$app->get('/getUsers', function() use ($app){
		$db = new DbHandler();
		if (!isset($_SESSION)) {
	        session_start();
	    }
	    $uid =  $_SESSION['uid'];
	    $data = $db->getData(" SELECT admin.id, admin.role, usertype.role_name, admin.password, emp.employee_type,
        emp.employee_id, emp.firstname, emp.mname, emp.lastname, emp.position_id,
        emp.contact_info, pos.description,usertype.role_id
        FROM admin LEFT JOIN employees emp ON admin.role = emp.role_id and admin.id = emp.id
        LEFT JOIN usertype ON admin.role = usertype.role_id
        LEFT JOIN position pos ON pos.id = emp.position_id ");
    	echo json_encode($data);
	});

    //********************Add User functionality*****************//
	$app->post('/addUser', function() use ($app){
		$postdata = file_get_contents("php://input");
	    $r = json_decode($postdata);
	    verifyRequiredParams(array('emp_id','username','password','fname','mname','lname','cellno','gender','usertype','position','role','schedule','address'),$r->customer);
	    $response = array();
	    $db = new DbHandler();
	    $emp_id = $r->customer->emp_id;
	    $username = $r->customer->username;
	    $password = $r->customer->password;
	    $fname = $r->customer->fname;
	    $mname = $r->customer->mname;
	    $lname = $r->customer->lname;
	    $bdate = $r->customer->bdate;
	    $cellno = $r->customer->cellno;
	    $gender = $r->customer->gender;
	    $usertype = $r->customer->usertype;
	    $position = $r->customer->position;
	    $role = $r->customer->role;
	    $schedule = $r->customer->schedule;
	    $address = $r->customer->address;
	    

	    $isUserExists = $db->getOneRecord("SELECT * from admin where username='$username'");
        if(!$isUserExists){

        	$db->insertRecord(" INSERT INTO admin(username, password, role) VALUES ('".$username."','".$password."','".$role."') ");
        	
           $db->insertRecord(" INSERT INTO employees( employee_id, firstname, mname, lastname, 
            address, birthdate, contact_info, gender, employee_type, position_id, role_id, schedule_id) 
        	VALUES ('".$emp_id."','".$fname."','".$mname."','".$lname."','".$address."','".$bdate."','".$cellno."','".$gender."','".$usertype."','".$position."','".$role."','".$schedule."') ");

            $response["status"] = "success";
            $response["message"] = "User account created successfully";
            echoResponse(200, $response);
                     
        }else{
            $response["status"] = "error";
            $response["message"] = "An users with the provided username exists!";
            echoResponse(201, $response);
        }
	});

	$app->get('/editUser/:id', function($id) use ($app){
	    $db = new DbHandler();
	    if (!isset($_SESSION)) {
	        session_start();
	    }
	    $uid =  $_SESSION['role'];
	    $user = $db->getData(" SELECT admin.id, emp.role_id,emp.gender, usertype.role_name, admin.password, 
	    emp.employee_type,admin.username,emp.birthdate,emp.address, emp.position_id, emp.schedule_id,
        emp.employee_id, emp.firstname, emp.mname, emp.lastname, emp.contact_info, pos.description
        FROM admin 
        LEFT JOIN employees emp ON admin.role = emp.role_id and admin.id = emp.id
        LEFT JOIN usertype ON admin.role = usertype.role_id LEFT JOIN position pos ON pos.id = emp.position_id 
        WHERE admin.id = '".$id."'");
        $result = array('user'=>$user);
	    echo json_encode($result);
	});

	$app->get('/deleteUser/:id', function($id) use ($app){
	    $db = new DbHandler();
	    $result = $db->deleteRecord(" DELETE t1,t2 FROM admin t1 INNER JOIN employees t2 ON t1.id = t2.id where t1.id = '$id' ");

	    if($result != NULL)
	    { 
	        $response["status"] = "success";
	        $response["message"] = "User deleted successfully";
	        echoResponse(200, $response);
	    }
	    else
	    {
	        $response["status"] = "error";
	        $response["message"] = "Failed to delete user. Please try again";
	        echoResponse(201, $response);
	    }
	});
	
	$app->put('/updateUser/:id', function($id) use ($app){
	    $response = array();
	    $r = json_decode($app->request->getBody());
	    verifyRequiredParams(array('USER_NAME','PASSWORD','ROLE','EMAIL'),$r->customer);
	    $db = new DbHandler();
	    $username = $r->customer->USER_NAME;
	    $password = $r->customer->PASSWORD;
	    $role = $r->customer->ROLE;
	    $email = $r->customer->EMAIL;

	    $stmt = $db->conn->prepare("UPDATE ICARD_COLLECTION_USER SET 
	    user_name='".$username."',password='".$password."',role='".$role."',email='".$email."'
	    WHERE user_id = '$id' ");
	    $result = $stmt->execute();

	    if($result != NULL)
	    { 
	        $response["status"] = "success";
	        $response["message"] = "User information updated successfully";
	        echoResponse(200, $response);
	    }
	    else
	    {
	        $response["status"] = "error";
	        $response["message"] = "Failed to update charge. Please try again";
	        echoResponse(201, $response);
	    }
	});

	$app->put('/changePass/:id', function($id) use ($app){
	    $response = array();
	    $r = json_decode($app->request->getBody());
	    verifyRequiredParams(array('oldPass'),$r->user);
	    $db = new DbHandler();
	    $password = $r->user->oldPass;

	    $stmt = $db->conn->prepare("UPDATE ICARD_COLLECTION_USER SET password='$password' WHERE user_id='$id'");
	    $result = $stmt->execute();

	    if($result != NULL)
	    { 
	      	$response["status"] = "success";
	        $response["message"] = "User information updated successfully";
	        echoResponse(200, $response);
	    }
	    else
	    {
	        $response["status"] = "error";
	        $response["message"] = "Failed to update charge. Please try again";
	        echoResponse(201, $response);
	    }
	});

?>