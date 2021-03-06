<?php
/**
 * file: action.php
 * 
 */

session_start();
if (!isset($_SESSION["access"])) $_SESSION["access"] = "deny";
require_once 'classes/User.DAO.class.php';
require_once 'classes/UserState.DAO.class.php';
require_once 'classes/functions.php';

$q = isset($_POST["q"])? $_POST["q"] : (isset($_GET["q"])? $_GET["q"] : null);

/**
 * Create a new user
 */
if(isset($q) && $q == "create_user") {
	$uDAO = new UserDAO();
	$u = new User();
	$u->name		= addslashes($_POST["name"]);
	$u->email 		= addslashes($_POST["email"]);
	$u->password 	= $_POST["password"];
	$u->birthday	= new DateTime($_POST["birthday"]);
	$u->gender		= $_POST["gender"];
	$u->belong_risk_ethnic_group = ($_POST["risk"] == 'Yes') ? TRUE : FALSE;
	$u->uid			= uniqid(null, true);
	$uDAO->create($u);
	
	$to = $u->email;
	
	$domain = "localhost";
	$server = "http://".$domain."/heartcalculator/";
	
	$subject = "The Heart Calculator - Please confirm your email address";
	
	$headers = "From: Swansea's Heart Calculator <no-reply@".$domain.">\r\n";
	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
	
	$message = '<!doctype html>
	<html>
	<head><meta charset="UTF-8"></head>
	<body>
	
	<table width="500">
	
	<tr>
	<td>
	<p>Aenean iaculis porta massa in tempor. Fusce hendrerit nec orci at elementum. Etiam rutrum mi eu interdum accumsan. Suspendisse tincidunt elementum massa, in ultricies tortor varius non. Phasellus convallis lectus quam, ut varius purus hendrerit a.</p>
	<p align="center"><a href="'.$server.'#/Confirm/'.$u->uid.'">'.$server.'#/Confirm/'.$u->uid.'</a></p>
	<p>Mauris neque tortor, cursus sed erat eu, rhoncus blandit nunc. Morbi imperdiet, nulla et consequat placerat, erat tortor commodo est, eu elementum purus augue vel leo.</p>
	<p align="right">Signature.</p>
	</td>
	</tr>
	</table>
	
	</body>
	</html>';
	
	if (mail($to, $subject, $message, $headers)) {
		echo "ok";
	} else {
		echo "not ok";
	}
}

/**
 * Confirm an email
 */
if(isset($q) && $q == "confirm") {
	$uid = $_GET["uid"];
	$uDAO = new UserDAO();
	$u = $uDAO->readByUid($uid);
	if ($u) {
		if ($u->confirmed == 0) {
			$u->confirmed = 1;
			$uDAO->update($u);
			echo "Your account has been confirmed. You can login now.";
		} else {
			echo "You account has already been confirmed.";
		}
	} else {
		echo "There is no user registered with this confirmation code.";
	}
}

/**
 * Login
 */
if (isset($q) && $q == 'login') {
	header('Content-Type: application/json');
	$email = $_POST["email"];
	$password_hash = md5($_POST["password"]);
	
	$uDAO = new UserDAO();
	if ($u = $uDAO->login($email, $password_hash)) {
		if ($u->confirmed == 1) {
			$auxDate = new DateTime();
			$age = $auxDate->sub(getDateIntervalFromDate($u->birthday))->format('y');
			
			$_SESSION["access"] = "allow";
			$_SESSION["id_user"] = $u->id_user;
			$_SESSION["age"] = $age;
			$_SESSION["gender"] = $u->gender;
			$_SESSION["risk"] = $u->belong_risk_ethnic_group;
			$_SESSION["name"] = $u->name;
			
			$r = array('permission' => TRUE);
			$r["data"] = array('gender'  => $u->gender, 
							   'age' 	 => $age,
							   'id_user' => $u->id_user,
							   'risk'	 => $u->belong_risk_ethnic_group,
							   'name' 	 => $u->name);
			
			
		} else {
			$r = array('permission' => 'not-confirmed');
		}
	} else
		$r = array('permission' => FALSE);
	
	echo json_encode($r);
}

/**
 * Check Login
 */
 if (isset($q) && $q == 'checkLogin') {
 	header("Content-Type: application/json");	
 	if ($_SESSION["access"] == "allow") {
 		$r = array('permission' => TRUE);
		$r["data"] = array('gender' => $_SESSION["gender"],
						   'age'	=> $_SESSION["age"],
						   'id_user'=> $_SESSION["id_user"],
						   'risk'	=> $_SESSION["risk"],
						   'name'	=> $_SESSION["name"]);
 	} else
		$r = array('permission' => FALSE);
	
	echo json_encode($r);
 }
 
 /**
  * Logout
  */
if (isset($q) && $q == "logout") {
	$_SESSION["access"] = "deny";
}

/**
 * Save the new state
 */
if (isset($q) && $q == "saveState") {
	$usDAO = new UserStateDAO();
	$us = new UserState();
	$us->id_user = $_SESSION["id_user"];
	$us->date = new DateTime();
	$us->tc_hdl = $_POST['tc_hdl'];
	$us->smoker = $_POST['smoker'] == 'Yes' ? TRUE : FALSE;
	$us->has_diabetes = $_POST['has_diabetes'] == 'Yes' ? TRUE : FALSE;
	$us->pressure_sys = $_POST['pressure_sys'];
	$us->pressure_dia = $_POST['pressure_dia'];
	$us->current = TRUE;
	$usDAO->create($us);
}

/**
 * Get the state history
 */
if (isset($q) && $q == 'getHistory') {
	header("Content-Type: application/json");
	$usDAO = new UserStateDAO();
	echo json_encode($usDAO->readAllFromUser(intval($_GET["id_user"])));
}

/**
 * Check whether an email address is already registered or not
 */
if (isset($q) && $q == 'checkEmail') {
	$uDAO = new UserDAO();
	$u = $uDAO->readByEmail(addslashes($_GET["email"]));
	if ($u == FALSE)
		echo "false"; // there is no one with that email
	else
		echo "true"; // someone has already registered with that email
}
?>
