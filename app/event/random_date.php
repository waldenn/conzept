<?php
 
//Generate a random year using mt_rand.
$year= mt_rand(1800, date("Y"));
 
//Generate a random month.
$month= mt_rand(1, 12);
 
//Generate a random day.

if(in_array($month, [1, 3, 5, 7, 8, 10, 12])) {
	$day= mt_rand(1, 31);
} elseif (in_array($month, [4, 6, 9, 11])) {
	$day= mt_rand(1, 30);
} else {
	$day= mt_rand(1, 28);
}
 
//Using the Y-M-D format.
$randomDate = $year . "-" .sprintf('%02d', $month) . "-" . sprintf('%02d', $day);

header("Location: index.php?date=".$randomDate);

?>
