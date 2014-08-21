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
		$sql = sprintf("insert into user values (null, '%s', '%s', '%s', '%s', %d, %d, '%s', 0)",
				$u->name,
				$u->email, 
				$u->password,
				$u->birthday->format("Y-m-d"),
				$u->gender == 'f' ? 0 : 1,
				$u->belong_risk_ethnic_group ? 1 : 0,
				$u->uid);
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
			$u->gender  		= ($row["gender"] == 1) ? 'm' : 'f';
			$u->belong_risk_ethnic_group  = ($row["risk_ethnic_group"] == 1) ? TRUE : FALSE;
			$u->uid  			= $row["uid"];
			$u->confirmed 		= ($row["confirmed"] == 1) ? TRUE : FALSE;
		}
		//$this->connection->free();
		return $u;
	}
	
	function readByUid($uid) {
		$sql = sprintf("select * from user where uid = '%s'", $uid);
		$this->connection->query($sql);
		$u = FALSE;
		if ($this->connection->num_rows() > 0) {
			$row = $this->connection->fetch_array();
			$u = new User();
			$u->id_user 		= $row["id_user"];
			$u->name 			= $row["name"];
			$u->email 			= $row["email"];
			$u->password_hash 	= $row["password"];
			$u->birthday 		= new DateTime($row["birthday"]);
			$u->gender  		= ($row["gender"] == 1) ? 'm' : 'f';
			$u->belong_risk_ethnic_group  = ($row["risk_ethnic_group"] == 1) ? TRUE : FALSE;
			$u->uid  			= $uid;
			$u->confirmed 		= ($row["confirmed"] == 1) ? TRUE : FALSE;
		}
		//$this->connection->free();
		return $u;
	}
	
	/**
	 *	
	 * @param User $u
	 */
	function update(User $u) {
		$currentUser = $this->read($u->id_user);
		$numberOfChanges = 0;
		$sql = sprintf("update user set");
		
		if ($currentUser->name != $u->name) {
			$sql .= sprintf(" name = '%s'", $u->name);
			$numberOfChanges++;
		}
		
		if ($currentUser->email != $u->email) {
			if ($numberOfChanges > 0)
				$sql .= ',';
			$sql .= sprintf(" email = '%s'", $u->email);
			$numberOfChanges++;
		}
		
		if ($currentUser->password != $u->password) {
			if ($numberOfChanges > 0)
				$sql .= ',';
			$sql .= sprintf(" password = '%s'", $u->password);
			$numberOfChanges++;
		}
		
		if ($currentUser->birthday != $u->birthday) {
			if ($numberOfChanges > 0)
				$sql .= ',';
			$sql .= sprintf(" birthday = '%s'", $u->birthday->format("Y-m-d"));
			$numberOfChanges++;
		}
		
		if ($currentUser->gender != $u->gender) {
			if ($numberOfChanges > 0)
				$sql .= ',';
			$sql .= sprintf(" gender = %d", $u->gender == 'f' ? 0 : 1);
			$numberOfChanges++;
		}
		
		if ($currentUser->belong_risk_ethnic_group != $u->belong_risk_ethnic_group) {
			if ($numberOfChanges > 0)
				$sql .= ',';
			$sql .= sprintf(" risk_ethnic_group = %d", $u->belong_risk_ethnic_group ? 1 : 0);
			$numberOfChanges++;
		}
		
		
		if ($currentUser->confirmed != $u->confirmed) {
			if ($numberOfChanges > 0)
				$sql .= ',';
			$sql .= sprintf(" confirmed = %d", $u->confirmed);
			$numberOfChanges++;
		}
		
		$sql .= sprintf(" where id_user = %d", $u->id_user);
		
		if ($numberOfChanges > 0)
			$this->connection->query($sql);
		
		return $currentUser;
	}
	
	function delete($id_user) {
		$sql = sprintf("delete from user where id_user = %d", $id_user);
		$this->connection->query($sql);
	}

	function login($email, $password_hash) {
		$sql = sprintf("select * from user where email = '%s' and password = '%s'", $email, $password_hash);
		$this->connection->query($sql);
		if ($this->connection->num_rows() > 0) {
			$row = $this->connection->fetch_array();
			return $this->read($row["id_user"]);
		}
		return FALSE;		
	}
}

?>