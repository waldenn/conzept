#!/usr/bin/php
<?PHP

include_once ( "/data/project/reasonator/public_html/widee/php/common.php" ) ;



$out = '' ;

/*
$extids = array() ;
$w = file_get_contents ( 'http://meta.wikimedia.org/w/index.php?title=Reasonator/stringprops&action=raw' ) ;
$w = explode ( "\n" , $w ) ;
foreach ( $w AS $l ) {
	if ( !preg_match ( '/^\|.*?\|\|\s*(\d+)\s*\|\|\s*(h.+!ID!.*)$/' , $l , $m ) ) continue ;
	$extids['P'.$m[1]] = $m[2] ;
}
$out .= "var ext_ids = " . json_encode($extids) . " ;\n" ;
*/

$extids = array() ;
$sparql = 'SELECT DISTINCT ?prop ?url WHERE { ?prop wdt:P31/wdt:P279* wd:Q18616576 OPTIONAL { ?prop wdt:P1630 ?url } FILTER ( bound(?url) ) }' ;
$j = getSPARQL ( $sparql ) ;
foreach ( $j->results->bindings AS $v ) {
	$p = preg_replace ( '/^.+\entity\//' , '' , $v->prop->value ) ;
	$extids[$p] = $v->prop->value ;
}
$out .= "var ext_ids = " . json_encode($extids) . " ;\n" ;
#print_r ( $j ) ; exit ( 0 ) ;

$db = openDB ( 'wikidata' , 'wikidata' ) ;
$sql = 'select pl_title,count(*) as cnt from pagelinks where pl_from_namespace=0 and pl_namespace=120 group by pl_title' ;

$propstats = array() ;
if(!$result = $db->query($sql)) die('There was an error running the query [' . $db->error . ']1'."\n$sql\n");
while($o = $result->fetch_object()){
	$propstats[$o->pl_title] = $o->cnt ;
}
$out .= "var propstats = " . json_encode($propstats) . " ;\n" ;


file_put_contents ( '/data/project/reasonator/public_html/widee/static.js' , $out ) ;

?>