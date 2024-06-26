<?php


    //********************Get Users functionality*****************//
	$app->get('/getCategory', function() use ($app){
		$db = new DbHandler();
	    $data = $db->getData(" SELECT * FROM category");
    	echo json_encode($data);
	});

    //********************Add User functionality*****************//
	$app->post('/addCategory', function() use ($app){
		$postdata = file_get_contents("php://input");
	    $r = json_decode($postdata);
	    verifyRequiredParams(array('category_name'),$r->customer);
	    $response = array();
	    $db = new DbHandler();
	    $category_name = $r->customer->category_name;

	    $isUserExists = $db->getOneRecord("SELECT * from category where category_name='$category_name'");
        if(!$isUserExists){
            $tabble_name = "category";
            $column_names = array('category_name');
            $result = $db->insertIntoTable($r->customer, $column_names, $tabble_name);
            if ($result != NULL) {
                $response["status"] = "success";
                $response["message"] = "Category created successfully";
                echoResponse(200, $response);
            } else {
                $response["status"] = "error";
                $response["message"] = "Failed to create category. Please try again";
                echoResponse(201, $response);
            }            
        }else{
            $response["status"] = "error";
            $response["message"] = "An category with the provided category name exists!";
            echoResponse(201, $response);
        }
	    
	});

?>