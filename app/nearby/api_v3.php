<?PHP

error_reporting(E_ERROR|E_CORE_ERROR|E_ALL|E_COMPILE_ERROR); # 
ini_set('display_errors', 'On');

#require_once ( 'php/oauth.php' ) ;
#require_once ( 'php/common.php' ) ;
require_once ( 'php/wikidata.php' ) ;
require_once ( 'php/Widar.php' ) ;

$tfc = new ToolforgeCommon ( 'wikishootme' ) ;
$tool_hashtag = $tfc->getRequest ( 'tool_hashtag' , 'wikishootme' ) ;
$action = $tfc->getRequest ( 'action' , '' ) ;
$oa = new MW_OAuth ( 'wikishootme' , 'commons' , 'wikimedia' ) ;

// GPS converter from http://stackoverflow.com/questions/2526304/php-extract-gps-exif-data#2572991
function gps($coordinate, $hemisphere) {
  for ($i = 0; $i < 3; $i++) {
    $part = explode('/', $coordinate[$i]);
    if (count($part) == 1) {
      $coordinate[$i] = $part[0];
    } else if (count($part) == 2) {
      $coordinate[$i] = floatval($part[0])/floatval($part[1]);
    } else {
      $coordinate[$i] = 0;
    }
  }
  list($degrees, $minutes, $seconds) = $coordinate;
  $sign = ($hemisphere == 'W' || $hemisphere == 'S') ? -1 : 1;
  return $sign * ($degrees + $minutes/60 + $seconds/3600);
}

function mydie ( $msg ) {
	global $out ;
	$out['status'] = $msg ;
	header ( 'application/json' ) ; // text/plain
	print json_encode($out) ;
	exit ( 0 ) ;
}

function redirect2url ( $url ) {
	header ( 'text/html' ) ;
	print '<html><head><meta http-equiv="refresh" content="0; url='.$url.'" /></head><body></body></html>' ;
	exit(0);
}

function fileExistsOnCommons ( $filename ) {
	$url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=File:" . urlencode(str_replace(' ','_',ucfirst(trim($filename)))) ;
	$j = json_decode ( file_get_contents ( $url ) ) ;
	$exists = false ;
	foreach ( $j->query->pages AS $k => $v ) {
		if ( $k != -1 ) $exists = true ;
	}
	return $exists ;
}

function setCoordinates ( $q , $coordinates ) {
	global $out ;
	if ( !preg_match ( '/^\s*(-?[0-9\.]+)\s*\/\s*(-?[0-9\.]+)\s*$/' , $coordinates , $m ) ) {
		$out['error'] = 'Bad coordinates' ;
		return ;
	}
	$q = 'Q' . preg_replace ( '/\D/' , '' , $q ) ;
	$oa = new MW_OAuth ( 'wikishootme' , 'wikidata' , 'wikidata' ) ;
	$claim = [
		"prop" => "P625" ,
		"lat" => $m[1]*1 ,
		"lon" => $m[2]*1 ,
		"q" => $q ,
		"type" => "location"
	] ;
	$out['claim'] = $claim ;
	if ( $oa->setClaim ( $claim ) ) {
	} else {
		$out['error'] = $oa->error ;
	}
	$out['res'] = $oa->last_res ;	
}

function addImageToItem ( $q , $image ) {
	global $out ;
	$image = ucfirst ( trim ( str_replace ( '_' , ' ' , $image ) ) ) ;
	$oa = new MW_OAuth ( 'wikishootme' , 'wikidata' , 'wikidata' ) ;
	$claim = [
		"prop" => "P18" ,
		"text" => $image ,
		"q" => $q ,
		"type" => "string"
	] ;
	$out['claim'] = $claim ;
	if ( $oa->setClaim ( $claim ) ) {
	} else {
		$out['error'] = $oa->error ;
	}
	$out['res'] = $oa->last_res ;	
}

if ( isset($_REQUEST['oauth_verifier']) ) redirect2url ( 'https://wikishootme.toolforge.org/' ) ;

$out = ['status'=>'OK'] ;

if ( $action == 'check' ) {
	$res = $oa->getConsumerRights() ;
	$out['result'] = $res ;
} else if ( $action == 'logout' ) {
	$oa->logout();
	exit(0);
} else if ( $action == 'authorize' ) {
	$oa->doAuthorizationRedirect('https://wikishootme.toolforge.org/api_v3.php');
	exit(0);

} else if ( $action == 'changeCoordinates' ) {

	$q = $tfc->getRequest ( 'q' , '' ) ;
	$coordinates = $tfc->getRequest ( 'coordinates' , '' ) ;
	if ( $q == '' or $coordinates == '' ) {
		$out['status'] = 'BAD PARAMETERS' ;
	} else {
		setCoordinates ( $q , $coordinates ) ;
	}

} else if ( $action == 'addImageToWikidata' ) {

	$image = $tfc->getRequest ( 'image' , '' ) ;
	$q = $tfc->getRequest ( 'q' , '' ) ;
	
	if ( !preg_match ( '/^Q\d+$/' , $q ) ) {
		$out['status'] = 'BAD Q NUMBER' ;
	} else if ( !fileExistsOnCommons($image) ) {
		$out['status'] = 'FILE DOES NOT EXIST ON COMMONS' ;
	} else {
		addImageToItem ( $q , $image ) ;
	}

} else if ( $action == 'new_item' ) {

	$lat = $tfc->getRequest ( 'lat' , '' ) ;
	$lng = $tfc->getRequest ( 'lng' , '' ) ;
	$label = $tfc->getRequest ( 'label' , '' ) ;
	$lang = $tfc->getRequest ( 'lang' , '' ) ;
	$p131 = $tfc->getRequest ( 'p131' , '' ) ;
	$p18 = $tfc->getRequest ( 'p18' , '' ) ;
	
	if ( $lat=='' or $lng=='' or $label=='' or $lang=='' ) mydie ( "Missing param" ) ;
	
	$data = array (
		'labels' => array ( $lang => array ( 'language' => $lang , 'value' => $label ) ) ,
		'claims' => array (
			array (
				'mainsnak' => array (
					'snaktype' => 'value' ,
					'property' => 'P625' ,
					'datavalue' => array (
						'value' => array (
							'latitude' => $lat*1 ,
							'longitude' => $lng*1 ,
							'altitude' => null ,
							'precision' => 0.0000001 ,
							'globe' => 'http://www.wikidata.org/entity/Q2'
						) ,
						'type' => 'globecoordinate'
					) ,
					'datatype' => 'globe-coordinate'
				) ,
				'type' => 'statement' ,
				'rank' => 'normal'
			)
		)
	) ;
	
	if ( $p131 != '' ) {
		$data['claims'][] = array (
			'mainsnak' => array (
				'snaktype' => 'value' ,
				'property' => 'P131' ,
				'datavalue' => array (
					'value' => array (
						'entity-type' => 'item' ,
						'numeric-id' => preg_replace ( '/\D/' , '' , $p131 ) * 1 ,
						'id' => $p131
					) ,
					'type' => 'wikibase-entityid'
				) ,
				'datatype' => 'wikibase-item'
			) ,
			'type' => 'statement' ,
			'rank' => 'normal'
		) ;
	}

	if ( $p18 != '' ) {
		$data['claims'][] = array (
			'mainsnak' => array (
				'snaktype' => 'value' ,
				'property' => 'P18' ,
				'datavalue' => array (
					'value' => $p18 ,
					'type' => 'string'
				) ,
				'datatype' => 'commonsMedia'
			) ,
			'type' => 'statement' ,
			'rank' => 'normal'
		) ;
	}
	
	$oa = new MW_OAuth ( 'wikishootme' , 'wikidata' , 'wikidata' ) ;
	if ( !$oa->createItem ( $data ) ) {
		$out['status'] = 'ERROR' ;
		$out['res'] = $oa->last_res ;
	} else {
		$out['q'] = $oa->last_res->entity->id ;
	}
	
	$out['data'] = $data ;

} else if ( $action == 'upload' or $action == 'upload_background' ) {

	// Get parameters
	$q = trim($tfc->getRequest('q','')) ;
	$new_file_name = trim($tfc->getRequest('wpDestFile','')) ;
	$desc = trim($tfc->getRequest('wpUploadDescription','')) ;
	if ( $q == '' or $new_file_name == '' or $desc == '' ) mydie ( 'Missing q/target/description') ;
	$comment = "New image for [[d:$q]]" ;

	// Check if item already has an image
	$wil = new WikidataItemList ;
	$wil->loadItem ( $q ) ;
	if ( $wil->hasItem($q) ) {
		$item = $wil->getItem($q) ;
		if ( $item->hasClaims('P18') ) mydie ( 'Already has an image' ) ;
	}
	
	// Get uploaded file
	$fo = $_FILES["file"] ;
	if ( !isset($fo["name"]) or $fo["name"] == '' or $fo['error']==1 or $fo['size']==0 ) mydie ( "No file" ) ;
	$local_file = $fo["tmp_name"] ;

	// Check EXIF coordinates
	$exif = exif_read_data ( $local_file , 'EXIF' ) ;
	if ( $exif == null or $exif == false ) {}
	else if ( isset ( $exif['GPSLatitudeRef'] ) ) {
		$e = $exif ;
		$coords = array ( 'lat' => gps($e["GPSLatitude"], $e['GPSLatitudeRef']) , 'lon' => gps($e["GPSLongitude"], $e['GPSLongitudeRef']) ) ;
	} else if ( isset ( $exif['GPS'] ) and isset ( $exif['GPS']['GPSLatitudeRef'] ) ) {
		$e = $exif['GPS'] ;
		$coords = array ( 'lat' => gps($e["GPSLatitude"], $e['GPSLatitudeRef']) , 'lon' => gps($e["GPSLongitude"], $e['GPSLongitudeRef']) ) ;
	}
	
	if ( isset ( $coords ) ) { // Add {{Location}}
		$location = '{{Location|'.$coords['lat'].'|'.$coords['lon']."}}\n" ;
		$desc = str_replace ( "<!--LOC-->\n" , $location , $desc ) ;
	} else { // No GPS
		$desc = str_replace ( "<!--LOC-->\n" , '' , $desc ) ;
	}

	
	// Check target file name
	$cnt = 0 ;
	$new_file_name = str_replace ( ' ' , '_' , ucfirst ( trim ( $new_file_name ) ) ) ;
	while ( 1 ) {
		$exists = fileExistsOnCommons ( $new_file_name ) ;
		if ( !$exists ) break ; // $new_file_name does not exist
		if ( $cnt == 0 ) preg_match ( '/^(.+)\.([a-z]+)$/' , $new_file_name , $m ) ;
		else preg_match ( '/^(.+)_\(\d+\)\.([a-z]+)$/' , $new_file_name , $m ) ;
		$cnt++ ;
		$new_file_name = $m[1] . '_(' . $cnt . ').' . $m[2] ;
	}
	$out['new_file_name'] = $new_file_name ;
	
	// Upload file
	$ignorewarnings = true ;
	if ( !$oa->doUploadFromFile ( $local_file , $new_file_name , $desc , $comment , $ignorewarnings ) ) mydie ( json_encode($oa->error) ) ;
	unlink ( $local_file ) ;
	
	// Add image to item
	addImageToItem ( $q , $new_file_name ) ;
	
	// Fin
	$url = "https://commons.wikimedia.org/wiki/File:".$tfc->urlEncode($new_file_name) ;
	if ( $action == 'upload' ) {
		// Load new file page on Commons
		redirect2url ( $url ) ;
	} else if ( $action == 'upload_background' ) {
		// Experimental!
		$out['data'] = array ( 'file' => $new_file_name , 'file_url' => $url , 'q' => $q ) ;
	}

} else {
	$widar = new \Widar ( 'wikishootme' ) ;
	//$widar->attempt_verification_auto_forward ( '/picturethis' ) ;
	//$widar->authorization_callback = 'https://wikishootme.toolforge.org/api_v3.php' ;
	if ( $widar->render_reponse(true) ) exit(0);

	$out['status'] = "UNKNOWN ACTION '{$action}'" ;
	$out['REQUEST'] = $_REQUEST ;
}

header ( 'application/json' ) ; // text/plain
if ( isset($_REQUEST['callback']) ) print $_REQUEST['callback'].'(' ;
print json_encode($out) ;
if ( isset($_REQUEST['callback']) ) print ');' ;

?>
