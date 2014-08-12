<?php
/**
 * 
 */

require_once 'User.class.php';

class UserState {
	private $user 			= NULL; // reference to the user whose state this is
	private $date 			= NULL; // a DateTime object
	private $tc_hdl 		= 4.5;
	private $smoker 		= FALSE;
	private $has_diabetes 	= FALSE;
	private $pressure_sys 	= 120;
	private $pressure_dia 	= 80;
	private $current 		= FALSE;
	
	function __set($what, $value) {
		$this->$what = $value;
	}
	
	function __get($what) {
		return $this->$what;
	}
}
?>