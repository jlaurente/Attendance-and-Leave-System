<?php
ini_set('memory_limit', '-1');
set_time_limit(0);
require 'libs/Slim/Slim.php';
require 'dbHandler.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();
require_once 'authentication.php';
require 'dashboard.php';
require 'user_management.php';
require 'schedule.php';
require 'category.php';
require 'timeEntry.php';
require 'leave.php';
require 'overtime.php';
$app->run();
    
/**
 * Verifying required params posted or not
 */
function verifyRequiredParams($required_fields,$request_params) {
    $error = false;
    $error_fields = "";
    foreach ($required_fields as $field) {
        if (!isset($request_params->$field) || strlen(trim($request_params->$field)) <= 0) {
            $error = true;
            $error_fields .= $field . ', ';
        }
    }

    if ($error) {
        // Required field(s) are missing or empty
        // echo error json and stop the app
        $response = array();
        $app = \Slim\Slim::getInstance();
        $response["status"] = "error";
        $response["message"] = 'Required field(s) ' . substr($error_fields, 0, -2) . ' is missing or empty';
        echoResponse(200, $response);
        $app->stop();
    }
}

function echoResponse($status_code, $response) {
    $app = \Slim\Slim::getInstance();
    // Http response code
    $app->status($status_code);

    // setting response content type to json
    $app->contentType('application/json');

    echo json_encode($response);
}
?>