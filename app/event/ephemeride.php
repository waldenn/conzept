<?php

function retrieve_wikidata($date, $language ) {

	$curl = curl_init();

	$current_url = file_get_contents("sparql.txt");


	$current_url = str_replace("replace_date", $date, $current_url);
	$current_url = str_replace("LANG", $language, $current_url);

  //echo $current_url;

	$current_url = urlencode($current_url);

	$current_url = "https://query.wikidata.org/sparql?query=".$current_url."&format=json";

	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	curl_setopt($curl, CURLOPT_URL, $current_url);

	curl_setopt($curl, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0");

	$result = curl_exec($curl);
	curl_close($curl);

	$response = json_decode($result, true);

	return $response;
}
