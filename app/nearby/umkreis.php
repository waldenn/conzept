<?PHP

$callback = $_REQUEST['callback'] ;
$lang = $_REQUEST['lang'] ;
$lat = $_REQUEST['lat'] ;
$lng = $_REQUEST['lng'] ;
$rang = $_REQUEST['radius'] ;
$limit = $_REQUEST['limit'] ;
if ( !isset ( $limit ) ) $limit = 100 ;

$url = "http://toolserver.org/~kolossos/wp-world/umkreis.php?la=$lang&submit=Table&lon=$lng&lat=$lat&rang=$rang&map=0&limit=$limit" ;
$html = file_get_contents ( $url ) ;

$html = array_pop ( explode ( '</form>' , $html , 2 ) ) ;
$html = array_shift ( explode ( '</table>' , $html , 2 ) ) ;
$rows = explode ( "</tr>" , $html ) ;
array_shift ( $rows ) ; // Header

$d = array () ;
foreach ( $rows AS $r ) {
	$cols = explode ( "</td>" , $r ) ;
	$e = array () ;
	foreach ( $cols AS $k => $v ) {
		$v = array_pop ( explode ( '<td>' , $v ) ) ;
		if ( $k == 0 ) $e['title'] = $v ;
		else if ( $k == 1 ) $e['lat'] = $v ;
		else if ( $k == 2 ) $e['lng'] = $v ;
		else if ( $k == 3 ) $e['feature'] = $v ;
		else if ( $k == 4 ) $e['psize'] = $v ;
		else if ( $k == 5 ) $e['summary'] = $v ;
	}
	if ( $e['title'] == '' ) continue ;
	
	$e['wikipediaUrl'] = $lang . '.wikipedia.org/wiki/' . urlencode ( str_replace ( ' ' , '_' , $e['title'] ) ) ;

	$lat1 = $lat ;
	$lon1 = $lng ;
	$lat2 = $e['lat'] ;
	$lon2 = $e['lng'] ;
	$distance = (3958*3.1415926*sqrt(($lat2-$lat1)*($lat2-$lat1) + cos($lat2/57.29578)*cos($lat1/57.29578)*($lon2-$lon1)*($lon2-$lon1))/180);
	$e['distance'] = round ( $distance , 2 ) ;
	
	$d[] = $e ;
}

if ( isset ( $_REQUEST['test'] ) ) {
	header('Content-type: text/html; charset=utf-8');
	print "<pre>" ; print_r ( $d ) ; print "</pre>" ;
} else {
	header('Content-type: application/x-json; charset=utf-8');
	print $callback . "(" . json_encode ( $d ) . ");" ;
}

?>