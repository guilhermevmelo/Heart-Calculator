<?php
require_once 'classes/User.DAO.class.php';

$q = $_POST["q"];

if(isset($q) && $q == "create_user") {
	$uDAO = new UserDAO();
	$u = new User();
	$u->name		= addslashes($_POST["name"]);
	$u->email 		= addslashes($_POST["email"]);
	$u->password 	= md5($_POST["password"]);
	$u->birthday	= new DateTime($_POST["birthday"]);
	$u->gender		= $_POST["gender"];
	$u->belong_risk_ethnic_group = ($_POST["risk"] == 'Yes') ? TRUE : FALSE;
	$u->uid			= uniqid(null, true);
	$uDAO->create($u);
	
	echo "ok";
}


?>
