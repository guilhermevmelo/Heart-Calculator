<?php
/**
 * 
 */
 
function getDateIntervalFromDate(DateTime $date) {
	$y = $date->format('Y');	
	$m = $date->format('m');
	$d = $date->format('d');
	
	$construct = 'P'.$y.'Y'.$m.'M'.$d.'D';
	$r = new DateInterval($construct);
	return $r;
}

?>