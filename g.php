<?php
require_once 'classes/UserState.DAO.class.php';
$usDAO = new UserStateDAO();

echo json_encode($usDAO->readAllFromUser(1));

?>