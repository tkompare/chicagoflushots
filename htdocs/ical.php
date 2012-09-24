<?php
/*
 * Echo an iCalendar for jquery.icalendar.js
*
* Written by Keith Wood (kbwood{at}iinet.com.au) July 2008
* Altered by Tom Kompare (tom@kompare.us) September 2012
*/
ini_set("display_errors", 1);
error_reporting(E_ALL & ~E_NOTICE);
// Only answer from its own host name.
$hostArray = explode(':',$_SERVER['HTTP_HOST']);
if($_SERVER['SERVER_NAME'] == $hostArray[0])
{
	$content = $_GET["content"];
	header("Content-type: text/calendar");
	header("Content-length: ".strlen($content));
	header("Content-disposition: attachment; filename=flushot.ics");
	echo $content;
}
else
{
	header("Location:" . trim($_SERVER['HTTP_REFERER']));
	exit();
}
?>