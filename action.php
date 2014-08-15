<?php
/**
 * file: action.php
 * 
 */

session_start();
require_once 'classes/User.DAO.class.php';

$q = isset($_POST["q"])? $_POST["q"] : $_GET["q"];

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
	$email = $_POST["email"];
	$password_hash = md5($_POST["password"]);
	
	$uDAO = new UserDAO();
	if ($u = $uDAO->login($email, $password_hash)) {
		if ($u->confirmed == 1) {
			$_SESSION["access"] = "allow";
			$_SESSION["id_user"] = $u->id_user;
			
			$auxDate = new DateTime();
			$age = $auxDate->sub(new DateInterval($u->birthday->format("Y-m-d")));
			
			echo "yes;;".$u->gender.";".$age;
		} else {
			echo "not-confirmed";
		}
	} else
		echo "no";
}
?>
