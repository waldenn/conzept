<?PHP

require_once ( '/data/project/reasonator/public_html/php/common.php' ) ;

$q = get_request ( 'q' , '' ) ;
$lang = get_request ( 'lang' , 'en' ) ;
$html = file_get_contents ( './index.html' ) ;

if ( $q == '' ) { print $html ; exit ( 0 ) ; }



ini_set('memory_limit','50M');
set_time_limit ( 60 * 10 ) ; // Seconds
error_reporting(E_ERROR|E_CORE_ERROR|E_ALL|E_COMPILE_ERROR);
require_once ( '/data/project/reasonator/public_html/php/wikidata.php' ) ;

#$use_autodesc = 'always_add' ; // 'only' , 'always_add' , 'never', 'fallback' # DEACTIVATED autodesc slow/not working, breaks script
$autodesc_mode = 'short' ; // 'short' , 'long'

$wil = new WikidataItemList ;
$wil->loadItem ( $q ) ;
$i = $wil->getItem ( $q ) ;
if ( !isset($i) ) { print $html ; exit ( 0 ) ; }

$head = "<head>\n" ;

// Twitter card

$label = escape_attribute ( $i->getLabel ( $lang ) ) ;

// Description
$desc = trim ( $i->getDesc ( $lang ) ) ;
if ( $use_autodesc == 'always_add' or $use_autodesc == 'only' or ( $use_autodesc == 'fallback' and $desc == '' ) ) { // Use autodesc
	$autodesc_url = "https://tools.wmflabs.org/autodesc/?q=$q&lang=$lang&mode=$autodesc_mode&links=text&redlinks=&format=json&get_infobox=yes&infobox_template=" ;
	$autodesc_result = file_get_contents ( $autodesc_url ) ;
	if ( isset($autodesc_result) and $autodesc_result !== null and $autodesc_result != '' ) {
		$autodesc_json = json_decode ( $autodesc_result ) ;
		if ( isset($autodesc_json) and $autodesc_json !== null ) {
			$auto_desc = $autodesc_json->result ;
			$auto_desc = preg_replace ( '/<.*?>/' , '' , $auto_desc ) ;
			$auto_desc = trim ( str_replace ( "\n" , ' ' , $auto_desc ) ) ;
			if ( $use_autodesc == 'only' ) {
				if ( $auto_desc != '' ) $desc = $auto_desc ;
			} else if ( $auto_desc != '' ) {
				if ( $desc != '' ) $desc .= '; ' ;
				$desc .= $auto_desc ;
			}
		}
	}
}
$desc = escape_attribute ( $desc ) ;

$head .= "
<meta property='og:title' content='$label'/>
<meta name='description' content='$desc'>
<meta name='og:description' content='$desc'>

<meta name='twitter:card' content='summary'>
<meta name='twitter:site' content='@wikidata'>
<meta name='twitter:creator' content='@MagnusManske'>
<meta name='twitter:title' content='$label'>
<meta name='twitter:description' content='$desc'>
" ;

$img = $i->getFirstString ( 'P18' ) ;
if ( $img != '' ) {
	$img_url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/" . myurlencode ( $img ) . "?width=300" ;
	$head .= "<meta name='twitter:image' content='$img_url'>\n" ;
	$head .= "<meta name='og:image' content='$img_url'>\n" ;
}


// Pre-cache
/*
// DEACTIVATED; slower than pure JS
$item_cache = (object) array() ;
$real_q = $i->getQ() ;
$item_cache->$real_q = $i->j ;

$head .= "<script>\n" ;
$head .= 'var item_cache = {'."\n" ;
$head .= "\t$q:" . json_encode ( $i->j ) ;

if ( isset($i->j->claims) ) {
	$q_to_load = [] ;
	foreach ( $i->j->claims AS $prop => $claims ) {
		$q_to_load[$prop] = $prop ;
		foreach ( $claims AS $claim ) {
			$cq = $i->getTarget ( $claim ) ;
			if ( $cq === false ) continue ;
			if ( !preg_match ( '/^Q\d+$/' , $cq ) ) continue ;
			$q_to_load[$cq] = $cq ;
		}
	}
	if ( count($q_to_load) > 0 ) {
		$wil->loadItems ( $q_to_load ) ;
		foreach ( $q_to_load AS $iq ) {
			$item = $wil->getItem ( $iq ) ;
			if ( !isset($item) or $item === false ) continue ;
			if ( !isset($item->j) ) continue ;
			$head .= ",\n\t$iq:" . json_encode($item->j) ;
//			$item_cache[$iq] = $item->j ;
		}
	}
}
$head .= "\n} ;\n" ;
$head .= "</script>\n" ;
*/

$html = str_replace ( '<head>' , $head , $html ) ;

print $html ;

flush();
ob_flush();
exit(0);

?>