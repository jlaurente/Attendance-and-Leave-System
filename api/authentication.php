<?php 
    //*************session functionality***********//
    $app->get('/session', function() {
        $db = new DbHandler();
        $session = $db->getSession();
        $response["uid"] = $session['uid'];
        $response["usertype_name"] = $session['usertype_name'];
        $response["role"] = $session['role'];
        $response['name'] = $session['name'];
        echoResponse(200, $session);
    });

    
    //*******************logout functionality************//
    $app->get('/logout', function() {
        $db = new DbHandler();
        $session = $db->destroySession();
        $response["status"] = "info";
        $response["message"] = "Logged out successfully";
        echoResponse(200, $response);
    });
?>