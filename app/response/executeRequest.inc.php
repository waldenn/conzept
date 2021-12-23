<?php

//
// executeRequest
//
// uses cURL to run a http(s) request.
// data, contentType, user, password are all optional
//
function executeRequest($target, $data, $contentType, $user, $password, &$http_status) {
	//try to send request to remote
	$i = 0;
	$max_tries = 3;
	$output = null;
	
	do {
		//log retries
		if($i > 0) {
			syslog(LOG_NOTICE, "Last try timed out. Retrying Request to " . $target);
		}

		//setup curl with url
		$ch = curl_init($target);

		//set options
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

		curl_setopt($ch, CURLOPT_TIMEOUT, 30); //timeout in seconds
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,10); 

		//forward content type header
		if($contentType) {
			curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: $contentType" ));
		}

		//POST data
		if($data!=false) {
			curl_setopt($ch, CURLOPT_POST, true );
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		}

		//user auth
		if($user && $password) {			
			curl_setopt($ch, CURLOPT_USERPWD, $user.':'.$password);
		}

		//GO!
		$output = curl_exec($ch);
		$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$curl_errno = curl_errno($ch);
		$curl_error = curl_error($ch);
		$curl_info = curl_getinfo($ch);
		if ($curl_errno == 0) {
			break;
		}
		curl_close($ch);
		
		//on error, repeat
		syslog(LOG_NOTICE, "cURL Error ($curl_errno): $curl_error");
		$i++;
	} while($i < $max_tries);

	return $output;
}
?>