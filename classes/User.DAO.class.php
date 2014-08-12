<?php 
/**
 * 
 */

require_once 'Connection.class.php';
require_once 'User.class.php';

class UserDAO {
	private $connection = NULL;
	
	function __construct() {
		$this->connection = new Connection();
	}
	
	function create(User $u) {
		$sql = sprintf("insert into user values (null, '%s', '%s', '%s', '%s', %d, %d, '%s', %d)",
				$u->name,
				$u->email, 
				$u->password,
				$u->birthday->format("Y-m-d"),
				$u->gender == 'f' ? 1 : 0,
				$u->belong_risk_ethnic_group ? 1 : 0,
				$u->uid,
				0);
		$this->connection->query($sql);
	}
	
	function read($id_user) {
		$sql = sprintf("select * from user where id_user = %d", $id_user);
		$this->connection->query($sql);
		$u = FALSE;
		if ($this->connection->num_rows() > 0) {
			$row = $this->connection->fetch_array();
			$u = new User();
			$u->id_user 		= $id_user;
			$u->name 			= $row["name"];
			$u->email 			= $row["email"];
			$u->password_hash 	= $row["password"];
			$u->birthday 		= new DateTime($row["birthday"]);
			$u->gender  		= ($row["gender"] == 1) ? 'f' : 'm';
			$u->belong_risk_ethnic_group  = ($row["risk_ethnic_group"] == 1) ? TRUE : FALSE;
			$u->uid  			= $row["uid"];
			$u->confirmed 		= ($row["confirmed"] == 1) ? TRUE : FALSE;
		}
		//$this->connection->free();
		return $u;
	}
	/**
	 * TODO update()
	 * @param User $u
	 */
	function update(User $u) {}
	
	function delete($id_user) {
		$sql = sprintf("delete from user where id_user = %d", $id_user);
		$this->connection->query($sql);
	}
}

?>