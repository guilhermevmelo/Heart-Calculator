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
	
	function create(UserState $u) {
		$sql = sprintf("insert into user_state values (null, '%s', %f, %d, %d, %d, %d, TRUE)",
				$u->date->format("Y-m-d H:i:s"),
				$u->tc_hdl,
				$u->smoker,
				$u->has_diabetes,
				$u->pressure_sys,
				$u->pressure_dia);
		
		$this->connection->query($sql);
	}
	
	function readLastFromUser($id_user) {
		$sql = sprintf("select * from user_state where id_user = %d order by date desc", $id_user);
		$this->connection->query($sql);
		$us = FALSE;
		if ($this->connection->num_rows() > 0) {
			$row = $this->connection->fetch_array();
			$us = new UserState();
			$us->id_user 	  = $row["id_user"];
			$us->date 		  = new DateTime($row["date"]);
			$us->tc_hdl 	  = $row["tc_hdl"];
			$us->smoker 	  = $row["smoker"];
			$us->has_diabetes = $row["diabetes"];
			$us->pressure_sys = $row["pressure_sys"];
			$us->pressure_dia = $row["pressure_dia"];
			$us->current 	  = ($row["current"] == 1) ? TRUE : FALSE;
		}
		return $us;
	}
	
	function readAllFromUser($id_user) {
		$sql = sprintf("select * from user_state where id_user = %d", $id_user);
		$this->connection->query($sql);
		if ($this->connection->num_rows() > 0) {
			$r = new ArrayObject();
			while ($row = $this->connection->fetch_array()) {
				$us = new UserState();
				$us->id_user 	  = $row["id_user"];
				$us->date 		  = new DateTime($row["date"]);
				$us->tc_hdl 	  = $row["tc_hdl"];
				$us->smoker 	  = $row["smoker"];
				$us->has_diabetes = $row["diabetes"];
				$us->pressure_sys = $row["pressure_sys"];
				$us->pressure_dia = $row["pressure_dia"];
				$us->current 	  = ($row["current"] == 1) ? TRUE : FALSE;
				$r->append($us);
			}
			
			return $r;
		}
		
		return FALSE;
	}
	
	/**
	 * 
	 */
	function read($id_user, DateTime $date) {
		$sql = sprintf("select * from user_state where id_user = %d and date = '%s'", $id_user, $date->format("Y-m-d H:i:s"));
		$this->connection->query($sql);
		$us = FALSE;
		if ($this->connection->num_rows() > 0) {
			$row = $this->connection->fetch_array();
			$us = new UserState();
			$us->id_user 	  = $row["id_user"];
			$us->date 		  = new DateTime($row["date"]);
			$us->tc_hdl 	  = $row["tc_hdl"];
			$us->smoker 	  = $row["smoker"];
			$us->has_diabetes = $row["diabetes"];
			$us->pressure_sys = $row["pressure_sys"];
			$us->pressure_dia = $row["pressure_dia"];
			$us->current 	  = ($row["current"] == 1) ? TRUE : FALSE;
		}
		return $us;
	}
	
	/**
	 * 
	 */
	function update(UserState $us) {
		$currentState = $this->read($us->id_user, $us->date);
		$numberOfChanges = 0;
		$sql = sprintf("update user_state set");
		
		if ($currentState->tc_hdl != $us->tc_hdl) {
			$sql .= sprintf(" tc_hdl = %f", $us->tc_hdl);
			$numberOfChanges++;
		}
		
		if ($currentState->date != $us->date) {
			if ($numberOfChanges > 0)
				$sql .= ',';	
			$sql .= sprintf(" date = '%s'", $us->date->format("Y-m-d H:i:s"));
			$numberOfChanges++;
		}
		
		if ($currentState->smoker != $us->smoker) {
			if ($numberOfChanges > 0)
				$sql .= ',';	
			$sql .= sprintf(" smoker = %d", ($us->smoker == TRUE) ? 1 : 0);
			$numberOfChanges++;
		}
		
		if ($currentState->has_diabetes != $us->has_diabetes) {
			if ($numberOfChanges > 0)
				$sql .= ',';	
			$sql .= sprintf(" diabetes = %d", ($us->has_diabetes == TRUE) ? 1 : 0);
			$numberOfChanges++;
		}
		
		if ($currentState->pressure_sys != $us->pressure_sys) {
			if ($numberOfChanges > 0)
				$sql .= ',';	
			$sql .= sprintf(" pressure_sys = %d", $us->pressure_sys);
			$numberOfChanges++;
		}
		
		if ($currentState->pressure_dia != $us->pressure_dia) {
			if ($numberOfChanges > 0)
				$sql .= ',';	
			$sql .= sprintf(" pressure_dia = %d", $us->pressure_dia);
			$numberOfChanges++;
		}
		
		if ($currentState->current != $us->current) {
			if ($numberOfChanges > 0)
				$sql .= ',';	
			$sql .= sprintf(" current = %d", ($us->current == TRUE) ? 1 : 0);
			$numberOfChanges++;
		}
		
		$sql .= sprintf(" where id_user = %d and date = '%s'", $us->id_user, $us->date->format("Y-m-d H:i:s"));
		if ($numberOfChanges > 0)
			$this->connection->query($sql);
		
		return currentState;
	}
	
	/**
	 * 
	 */
	function delete($id_user, DateTime $date) {
		$sql = sprintf("delete from user_state where id_user = %d and date = '%s'", $id_user, $date->format("Y-m-d H:i:s"));
		$this->connection->query($sql);
	}
}

?>