#!/usr/bin/php
<?PHP

#header("Connection: close");
#header('Content-type: text/html; charset=UTF-8'); // UTF8 test
//header('Content-type: text/plain; charset=UTF-8'); // UTF8 test
#header("Cache-Control: no-cache, must-revalidate");

function addPattern ( $pattern , $h , $tag ) {
	global $meta ;
	if ( !preg_match_all ( $pattern , $h , $m0 ) ) return $h ;
	foreach ( $m0[1] as $m ) {
		$file = preg_replace ( '|^/magnustools/|' , '/data/project/magnustools/public_html/' , $m ) ;
		$css = file_get_contents ( $file ) ;
//		if ( $tag == 'script' ) $css = preg_replace ( '|\/\/.*$|' , '' , $css ) ;
		if ( $tag != 'script' ) $css = str_replace ( "\n" , ' ' , $css ) ;
//		$css = preg_replace ( '|\/\*.*?\*\/|' , '' , $css ) ;
		$css = "<$tag>\n$css\n</$tag>" ;
		$meta[] = $css ;
	}
	$h = preg_replace ( $pattern , '' , $h ) ;
	return $h ;
}

$h = file_get_contents ( 'index_dev.html' ) ;

// Remove comments
$h = str_replace ( "\n" , ' ' , $h ) ;
$h = preg_replace ( '/<!--.*?-->/' , '' , $h ) ;

$meta = array() ;

// Extract CSS
$q = '["'."']" ;
$h = addPattern ( "|<link.*?href=$q(.+?)$q.*?>|i" , $h , 'style' ) ;
$h = addPattern ( "|<script.*?src=$q(.+?)$q.*?>\s*</script>|i" , $h , 'script' ) ;

$h = str_replace ( '</head>' , implode('',$meta).'</head>' , $h ) ;


// Cleanup
$h = preg_replace ( '/ +/' , ' ' , $h ) ;
//$h = preg_replace ( '/> </' , '><' , $h ) ;

file_put_contents ( 'index.html' , $h ) ;

?>