<?php


include 'ephemeride.php';
include("header_index.php");
include("nav_bar_index.php");

?>

<p style="margin-top:2em">You can make a query on any historical day (although you will typically get more results starting in the 19th century)</p>

<p>You have to use a standard date format (either 1900-12-31 or 31-12-1900). Slashes work as well.</p>
			<form action="index.php">
				<div style="display:block;width:100%">
					<div style="float:left;margin-left:5%;">
						<p><input name="date" type="text" placeholder="01-01-1960 or 1960-01-01" size="20" style="font-size:1em"></p>
					</div>
				</div>
				<div style="float:left;clear: left;margin-left:30%;">
					<input type="submit" value="Submit" style="font-size:.9em">
				</div>
			</form>

</div></div></body></html>
