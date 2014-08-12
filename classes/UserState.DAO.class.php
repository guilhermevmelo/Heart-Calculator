<?php 
/**
 * 
 */

require_once 'Connection.class.php';
require_once 'UserState.class.php';

class UserStateDAO {
	private $connection = NULL;
	
	function __construct() {
		$this->connection = new Connection();
	}
	
	function create(UserState $u) {}
	
	function read($id_user) {}
	
	function update(UserState $u) {}
	
	function delete($id_user) {}
}

?>