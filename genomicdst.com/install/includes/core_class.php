<?php defined('ACCESS') OR exit('No direct script access allowed');

class Core {
    
	function redirect()
	{
		$redirect = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") ? "https" : "http");
        $redirect .= "://".$_SERVER['HTTP_HOST'];
        $redirect .= str_replace( basename($_SERVER['SCRIPT_NAME']), "", $_SERVER['SCRIPT_NAME'] );
        $redirect = str_replace( 'install/', '', $redirect ); 
        return $redirect;
	}
	
	function get_state()
	{
		return ( isset( $_COOKIE["install_state"] ) ) ? $_COOKIE["install_state"] : "-1";
	}
	
	function set_state( $state ) 
	{
		setcookie( "install_state", $state, time() + 86400, "/" );
	}
    
    function delete_state()
    {
        setcookie( "install_state", "0", time() - 86400, "/" );
    }
	
	function validate_db_config( $data )
	{
		return ( !empty( $data['db_hostname'] ) &&
          	     !empty( $data['db_username'] ) && 
                 !empty( $data['db_database'] ) );
	}
	
	function validate_main_config( $data )
	{
		return ( !empty( $data['main_base_url'] ) );
	}
	
	function validate_admin_config( $data )
	{
		return ( !empty( $data['custom_admin_name'] ) &&
				 !empty( $data['custom_admin_email'] ) &&
				 !empty( $data['custom_admin_password'] ) &&
				 !empty( $data['custom_admin_password_retype'] ) );
	}
	
	function validate_hosts_config( $data )
	{
		return ( !empty( $data['hosts_miner1_ip'] ) &&
				 !empty( $data['hosts_miner1_port'] ) &&
				 !empty( $data['hosts_miner2_ip'] ) &&
				 !empty( $data['hosts_miner2_port'] ) &&
				 !empty( $data['hosts_miner3_ip'] ) &&
				 !empty( $data['hosts_miner3_port'] ) );
	}
		
	function check_admin_password( $data )
	{
		return ( $data['custom_admin_password'] === $data['custom_admin_password_retype'] );	
	}
	
	function write_config( $data, $type, $output_path ) 
	{
		switch( $type ) :
			case "main":
				return $this->write_main_config( $data, $output_path );
				break;
			case "db":
				return $this->write_db_config( $data, $output_path );
				break;
			case "admin":
				return $this->write_admin_config( $data, $output_path );
				break;
			case "hosts":
				return $this->write_hosts_config( $data, $output_path );
				break;
		endswitch;
	}
	
	private function write_main_config( $data, $output_path )
	{
		$main_config_file = file_get_contents( 'templates/config.local.php' );
		
		$new = str_replace( "%BASE_URL%", $data['main_base_url'], $main_config_file );
		
		$handle = fopen( $output_path, 'w+' );
		
		@chmod( $output_path, 0777 );

		if( is_writable( $output_path ) ) 
			if( fwrite( $handle, $new ) ) return true;
			else return false;
		else return false;
	}
	
	private function write_db_config( $data, $output_path )
	{
		$main_config_file = file_get_contents( $output_path );
		
		$new  = str_replace( "%HOSTNAME%", $data['db_hostname'], $main_config_file );
		$new  = str_replace( "%USERNAME%", $data['db_username'], $new );
		$new  = str_replace( "%PASSWORD%", $data['db_password'], $new );
		$new  = str_replace( "%DATABASE%", $data['db_database'], $new );
		
		$handle = fopen( $output_path, 'w+' );
		
		@chmod( $output_path, 0777 );

		if( is_writable( $output_path ) ) 
			if( fwrite( $handle, $new ) ) return true;
			else return false;
		else return false;
	}
	
	private function write_admin_config( $data, $output_path )
	{
		$main_config_file = file_get_contents( $output_path );
		
		$new = str_replace( "%ADMIN_NAME%", $data['custom_admin_name'], $main_config_file );
		$new = str_replace( "%ADMIN_EMAIL%", $data['custom_admin_email'], $new );
		
		$handle = fopen( $output_path, 'w+' );
		
		@chmod( $output_path, 0777 );

		if( is_writable( $output_path ) ) 
			if( fwrite( $handle, $new ) ) return true;
			else return false;
		else return false;
	}
	
	private function write_hosts_config( $data, $output_path )
	{
		$main_config_file = file_get_contents( $output_path );
		
		$formatted_hosts = "[";
		$formatted_hosts .= "\"http://".$data['hosts_miner1_ip'].":".$data['hosts_miner1_port']."\",";
		$formatted_hosts .= "\"http://".$data['hosts_miner2_ip'].":".$data['hosts_miner2_port']."\",";
		$formatted_hosts .= "\"http://".$data['hosts_miner3_ip'].":".$data['hosts_miner3_port']."\"";
		$formatted_hosts .= "]";
		
		$new = str_replace( "%HOST_ADDRESSES%", $formatted_hosts, $main_config_file );
		
		$handle = fopen( $output_path, 'w+' );
		
		@chmod( $output_path, 0777 );

		if( is_writable( $output_path ) ) 
			if( fwrite( $handle, $new ) ) return true;
			else return false;
		else return false;
	}
}