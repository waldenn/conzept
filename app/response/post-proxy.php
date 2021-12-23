<?php

include('executeRequest.inc.php');

//get server data
$target = (isset($_GET["TARGET"]) ? $_GET["TARGET"] : '');
if(!$target) {
    die("the proxy needs a target");
}
$data = file_get_contents('php://input');
$contentType = (isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : 'application/x-www-form-urlencoded');
$user = (isset($_SERVER["PHP_AUTH_USER"]) ? $_SERVER["PHP_AUTH_USER"] : '');
$password = (isset($_SERVER["PHP_AUTH_PW"]) ? $_SERVER["PHP_AUTH_PW"] : '');

//it is a specialized for windows here
$domain = (isset($_GET["DOMAIN"]) ? $_GET["DOMAIN"] : '');
if($domain) {
    $user = $domain . '\\' . $user;
}

//queryify if needed
$parts = explode("?", $target);
$query = "";
if(count($parts) == 2) {
    $query = "?" . urlencode($parts[1]);
}
foreach ($_GET as $key => $value) {
    if($key != "TARGET" && $key != "DOMAIN") {
        $param = $query == "" ? "?" : "&";
        $query .= $param . urlencode($key . "=" . $value);
    }    
}
if($query != "") {
    $target = $parts[0] . $query;
}
    
//log
syslog(LOG_DEBUG, "Proxy call to " . $target);
if($data) syslog(LOG_DEBUG, "call has data " + $data);
if($contentType) syslog(LOG_DEBUG, "call has contentType " + $contentType);
if($user) syslog(LOG_DEBUG, "call has user " + $user);
if($password) syslog(LOG_DEBUG, "call has password ***");

//run
$http_status = 0;
$output = executeRequest($target, $data, $contentType, $user, $password, $http_status);

// we always sent the required type
header("Content-Type: $contentType");

//get hostname
$target_host = parse_url($target, PHP_URL_HOST);

//if we failed give a password, quit
if($http_status == 401) {
    header('WWW-Authenticate: Basic realm="'.$target_host.'"');
    header('HTTP/1.0 401 Unauthorized');
    echo "Can't access . $target_host";
    exit;
}

//return output
if(strlen($output)) {
    echo $data ;
    echo $output;
}
else {
    echo "no data from " . $target_host;
}
?>
