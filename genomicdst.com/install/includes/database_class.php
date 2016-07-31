<?php defined('ACCESS') OR exit('No direct script access allowed');

class Database {

	function test_db_connection( $data )
	{
		$mysqli = new mysqli( 
					$data['db_hostname'], 
					$data['db_username'], 
					$data['db_password'], '' );

		if( mysqli_connect_errno() ) return false;
		
		$mysqli->close();
		
		return true;
	}
	
	function create_database( $data )
	{
		$mysqli = new mysqli( 
					$data['db_hostname'], 
					$data['db_username'], 
					$data['db_password'], '' );

		if( mysqli_connect_errno() ) return false;
		
		$mysqli->query( "CREATE DATABASE IF NOT EXISTS {$data['db_database']}" );

		$mysqli->close();

		return true;
	}

	function create_tables( $data )
	{
		$mysqli = new mysqli( 
					$data['db_hostname'], 
					$data['db_username'], 
					$data['db_password'], 
					$data['db_database'] );

		if( mysqli_connect_errno() ) return false;

		$query = file_get_contents('assets/install.sql');

		$mysqli->multi_query( $query );

		$mysqli->close();

		return true;
	}
	
	function create_admin( $data )
	{
		$mysqli = new mysqli( 
					$data['db_hostname'], 
					$data['db_username'], 
					$data['db_password'], 
					$data['db_database'] );
		
		if( mysqli_connect_errno() ) return false;
		
		$password = $this->generate_hash( $data["custom_admin_password"] );
		
		$query = "INSERT INTO `users` (`unit_id`, `unit_name`, `email`, `password`, `status`) VALUES ";
		$query .= "(1, '{$data['custom_admin_name']}', '{$data['custom_admin_email']}', '{$password}', 1)";

		$mysqli->query( $query );
		
		$mysqli->close();

		return true;
	}
	
    private function generate_unique_salt() 
	{
        return substr( sha1(mt_rand()), 0, 22 );
    }
    
    private function generate_hash( $password ) 
	{
        return crypt( 
            $password, 
            "$2a$" . "10" . '$' . $this->generate_unique_salt() 
        );
	}
}