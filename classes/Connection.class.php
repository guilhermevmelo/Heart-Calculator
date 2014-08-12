<?php
/**
 * 
 */

class Connection {
	const HOST 	= "localhost";
	const USER 	= "heartcalculator";
	const PASS 	= "n5amxPbR7h";
	const DB	= "heartcalculator";
	
	private $connection 	= NULL; // This will be a mysqli object
	private $query_result 	= NULL;	// This will be a mysqli_result object
	
	function __construct() {
		$this->connection = new mysqli(Connection::HOST, Connection::USER, Connection::PASS, Connection::DB);
		if ($this->connection->connect_errno > 0)
			die("Unable to connect to the database.");	
	}
	
	function __destruct() {
		$this->free();
		$this->connection->close();
	}
	
	function query($sql) {
		$this->query_result = $this->connection->query($sql);
		if ($this->query_result == NULL)
			die("An error occurred while querying the database.");
	}
	
	function free() {
		if ($this->query_result instanceof mysqli_result)
			$this->query_result->free();
	}
	
	function fetch_array() {
		return $this->query_result->fetch_array();
	}
	
	function num_rows() {
		return $this->query_result->num_rows;
	}
}
?>
