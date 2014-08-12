<?php
/**
 * 
 */

class User {
	private $id_user 	= NULL;
	private $name		= NULL;
	private $email 		= NULL;
	private $password 	= NULL; //stores the md5 hash of the actual password
	private $birthday 	= NULL;
	private $gender 	= NULL;
	private $belong_risk_ethnic_group = FALSE; //bool
	private $uid 		= NULL;
	private $confirmed 	= FALSE;
	
	function __set($what, $value) {
		switch($what){
			case "password":
				$value = md5($value);
				break;
			
			case "password_hash":
				$what = "password";
				break;
			
			default: break;
		}
		
		$this->$what = $value;
	}
	
	function __get($what) {
		return $this->$what;
	}
}
?>
