<?php defined('BASEPATH') OR exit('No direct script access allowed');

class DST_Access_Model extends CI_Model 
{
	private $admin_email;
	private $admin_name;
	
	private $non_view_links;
	private $system_user_types;
	
	public function __construct()
    {
        parent::__construct();
        
        $this->admin_email = $this->config->item( 'admin_email' );
		$this->admin_name = $this->config->item( 'admin_name' );
		
		$this->non_view_links = array( 'validate_login', 'logout' );
		$this->system_user_types = array( "admin", "user" );
    }
	
	/*
	* Check's if the user email is present in the 
	* research group's user database
	*/
	public function check_email( $email )
	{
		$entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'email' ), 
				array( 'email' => $email ), 
				'users' 
			);
		if( sizeof($entries->row()) !== 0 ) :
			return ( $email == $entries->row()->email );
		endif;
		return FALSE;
	}
	
	/*
    * Check if password is same with database entry
    * by recreating the user's hash 
    */
    public function check_password( $email, $password ) 
	{
		$entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'password' ), 
				array( 'email' => $email ), 
				'users' 
			);
		
		$hash = $entries->row()->password;
		
        $full_salt = substr( $hash, 0, 29 ); // algo + cost + salt
        $new_hash = crypt( $password, $full_salt );
		
        return ( $hash === $new_hash );
    }
	
	/*
	* Checks if the status of the account of the user is 
	* approved by the administrator.
	*/
	public function check_status( $email )
	{
		$entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'status' ), 
				array( 'email' => $email ), 
				'users' 
			);
		return ( $entries->row()->status == 1 );
	}

	/*
	* Checks if the current user can access specific links
	*/
	public function check_user_access()
	{
		/* PREVENTS DIRECT ACCESS TO USER UPLOAD PAGE */
		if( !$this->DST_Access_Model->get_upload_state() && uri_string() === "user/upload" && $this->get_previous_page() === "user/upload" ) :
			redirect( base_url( "user/select" ) );
		elseif( !$this->DST_Access_Model->get_upload_state() && uri_string() === "user/upload" ) :
			redirect( base_url( $this->get_previous_page() ) );
		endif;
		
		if( $this->get_previous_page() === "user/upload" ) : 
			$this->set_upload_state( FALSE );
		endif;
		
		/* GENERAL ACCESS PRIVILEGE CHECK */
		if( !in_array( uri_string(), $this->non_view_links ) ) :
		
			$user_information = $this->get_user_information();
			$user_uri = $this->uri->segment(1);
			
			if( is_null( $user_information ) && !is_null( $user_uri ) ) :
				if( in_array( $user_uri, $this->system_user_types ) ) :	
					redirect( base_url() );
				endif;
			elseif( !is_null( $user_information ) && is_null( $user_uri ) ) :
				redirect( base_url( $this->get_previous_page() ) );
			elseif( !is_null( $user_information ) && !is_null( $user_uri ) ):
				if( $user_uri != $user_information["usertype"] ) :
					redirect( base_url( $this->get_previous_page() ) );
				endif;
			endif;
		
		endif;
	}
	
	/*
	* Gets the login error cookie
	* Returns a JSON object
	*/
	public function get_login_error()
	{
		return $this->DST_Session_Model->retrieve_entry( "login_error" );
	}

	/*
	* Sets the login error cookie
	*/
	public function set_login_error( $email = NULL, $password_error = FALSE, $status_error = FALSE )
	{
		if( isset( $email ) && !$password_error && !$status_error ) :
			$message = "Please enter an email address!";
		elseif( isset( $email ) && $password_error && !$status_error ) :
			$message = "Please enter valid password!";
		elseif( isset( $email ) && !$password_error && $status_error ) :
			$message = "Wait for administrator approval.";
		else :
			$this->DST_Session_Model->delete_entry( "login_error" );
			return;
		endif;
		
		$value['type'] = "login";
		
		if( $password_error ) :
			$value['email'] = $email;
		endif;
		
		$value['alert']['msg'] = $message; 
		$value['alert']['type'] = 'alert'; 
			
		$json = json_encode( $value ); // FOR CLIENTSIDE JAVASCRIPT
		
		$this->DST_Session_Model->add_entry( array( "login_error" => $json ) );
	}

	/*
	* Gets the user information from the encrypted cookies
	*/
	public function get_user_information()
	{
		return $this->DST_Session_Model->retrieve_entry( "user" );
	}
	
	/*
	* Sets the user information by passing on an array to be encoded 
	* as encrypted cookies
	*/
	public function set_user_information( $data = NULL )
	{
		if( !is_array( $data ) ) :
		
			$this->DST_Session_Model->delete_entry( "user" );
		
			$usertype = "user";
			if( $data === $this->admin_email ) :
				$usertype = "admin";
			endif;

			$array = array(
                'unit_id' => $this->get_unit_id( $data ),
				'username' => $this->get_unit_name( $data ),
				'usertype' => $usertype
			);
		
		else :
		
			$old_array = $this->get_user_information();
			$array = array_merge( $old_array, $array );
		
		endif;
	
		$this->DST_Session_Model->add_entry( array( "user" => $array ) );
	}
	
	/*
	* Deletes the entire session to log out the user.
	*/
	public function logout_user()
	{
		$this->DST_Session_Model->delete_session_cookie( "dst_session" );
	}
	
	/*
	* Creates a database entry for a newly signed user.
	*/
	public function create_new_user( $name, $email, $password )
	{
        // get hash of password
		$hash = $this->DST_Encryption_Model->generate_hash( $password );
        
        // get latest unit id
        $units = $this->DST_Database_Model->view_entry(
            array( "unit_id" ),
            array(),
            "users"
        )->result( "array" );
        
        $unit_id = intval( $units[sizeof($units)-1]["unit_id"] ) + 2;        
        
		$array = 
			array(
                "unit_id" => $unit_id,
				"unit_name" => $name,
				"email" => $email,
				"password" => $hash,
				"status" => 0
			);
		$this->DST_Database_Model->add_entry( $array, "users" );
        
        $user_table_status = 
            array(
                "unit_id" => $unit_id,
                "table_id" => 0,
                "timestamp" => "00-00-00 00:00:00",
                "isset" => 0
            );
        
        return $this->DST_Database_Model->add_entry( $user_table_status, "user_table_status" );
	}
	
	/*
	* Gets the signup error cookie
	* Returns a JSON object
	*/
	public function get_signup_error()
	{
		return $this->DST_Session_Model->retrieve_entry( "signup_error" );
	}
	
	/*
	* Sets the signup error cookie
	*/
	public function set_signup_error( $name = NULL, $email = NULL, $password = FALSE, $added = FALSE )
	{
		$value['type'] = "signup";
		$value['name'] = $name;
		
		if( isset( $name ) && !isset( $email ) && !$password && !$not_added ) :
			$message = "That email is already taken! Please select a new one.";
		elseif( isset( $name ) && isset( $email ) && !$password && !$not_added ) :
			$message = "You have entered two mismatched passwords!";
		elseif( isset( $name ) && isset( $email ) && $password && !$not_added ) :
			$message = "Something went wrong. Please try again.";
		else:
			$this->DST_Session_Model->delete_entry( "signup_error" );
			return;
		endif;
		
		if( isset( $email ) ) :
			$value['email'] = $email;
		endif;
		
		$value['alert']['msg'] = $message; 
		$value['alert']['type'] = 'alert'; 
			
		$json = json_encode( $value ); // FOR CLIENTSIDE JAVASCRIPT
		
		$this->DST_Session_Model->add_entry( array( "signup_error" => $json ) );
	}
	
	/*
	* Gets the uri for the previous page
	*/
	public function get_previous_page()
	{
		return $this->DST_Session_Model->retrieve_entry( "previous_page" );
	}
	
	/*
	* Sets the uri for the previous page
	*/
	public function set_previous_page( $uri = "" )
	{
		$this->DST_Session_Model->add_entry( array( "previous_page" => $uri ) );
	}
	
	/*
	* Indicates if the input email (username) is the admin's
	*/
	public function is_admin( $email )
	{
		return ( $email === $this->admin_email );
	}
	
    /*
	* Retrieve's unit ID from database
	*/
    public function get_unit_id( $email )
	{
		$entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'unit_id' ), 
				array( 'email' => $email ), 
				'users' 
			);
		return $entries->row()->unit_id;
	}
	
	/*
	* Retrieve's unit name from database
	*/
	public function get_unit_name( $email )
	{
		$entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'unit_name' ), 
				array( 'email' => $email ), 
				'users' 
			);
		return $entries->row()->unit_name;
	}
    
	/*
	* Sets the upload cookie to enabled or disabled
	*/
	public function set_upload_state( $enabled )
	{
		$this->DST_Session_Model->add_entry( array( "upload_enabled" => $enabled ) );
	}
	
	/*
	* Gets the current upload cookie state
	*/
	public function get_upload_state()
	{
		return boolval( $this->DST_Session_Model->retrieve_entry( "upload_enabled" ) ); 
	}
    
    /*
    * Sets the selected disease name;
    * used in results retrieval page.
    */
    public function set_selected_disease_name( $disease_name )
    {
        $this->DST_Session_Model->add_entry( 
            array( "selected_disease" => $disease_name ) 
        );
    }
    
    /*
    * Gets the selected disease name;
    * used in results retrieval page.
    */
    public function get_selected_disease_name()
    {
        return $this->DST_Session_Model->retrieve_entry( "selected_disease" );
    }
    
    /*
    * Sets the marker table name for the retrieve page
    */
    public function set_retrieve_marker_table( $table_name )
    {
        $this->DST_Session_Model->add_entry( 
            array( "marker_table_name" => $table_name ) 
        );
    }
    
    /*
    * Gets the marker table name for the retrieve page
    */
    public function get_retrieve_marker_table()
    {
        return $this->DST_Session_Model->retrieve_entry( "marker_table_name" );
    }
}
