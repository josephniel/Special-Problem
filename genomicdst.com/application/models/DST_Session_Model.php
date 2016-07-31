<?php defined('BASEPATH') OR exit('No direct script access allowed');

class DST_Session_Model extends DST_Encryption_Model 
{
	private $session_values;
	private $cookie_expiry;
	
	public function __construct()
    {
        parent::__construct();
        
		$this->cookie_expiry = $this->config->item( 'cookie_expiry' ); 
		
		if( !$this->has_session_cookie() ) :
			$this->session_values = array();
		else :
			$this->session_values = $this->get_session_cookie();
		endif;
    }
	
	/*
	* Adds a session entry to the main session ( dst_session );
	* this also serves as an edit function whenever the sesseion 
	* entry key is already present in the main session.
	*/
	public function add_entry( $array )
	{
		foreach( $array as $key => $value ) :
			$this->session_values[$key] = $value;
		endforeach;
		$this->set_session_cookie( $this->session_values );
	}
	
	/*
	* Deletes a session entry from the main session ( dst_session ).
	*/
	public function delete_entry( $key )
	{
		if( array_key_exists( $key, $this->session_values ) ) :
			unset( $this->session_values[$key] );
		else :
			return NULL;
		endif;
		$this->set_session_cookie( $this->session_values );
	}
	
	/*
	* Retrieves a session entry from the main session ( dst_session ).
	*/
	public function retrieve_entry( $key )
	{
		return array_key_exists( $key, $this->session_values ) ? $this->session_values[$key] : NULL;
	}
	
	/*
	* Deletes the whole session ( dst_session ).
	*/
	public function delete_session_cookie( $id )
	{
		delete_cookie( $id );
	}
	
	/*
	* Checks if the main session ( dst_session ) is present.
	*/
	private function has_session_cookie()
	{
		return ( is_null( get_cookie( "dst_session" ) ) ) ? FALSE : TRUE;
	}
	
	/*
	* Retrieves the whole session ( dst_session ).
	*/
	private function get_session_cookie()
	{
		$encrypted_array = get_cookie( "dst_session" );
		$serialized_array = $this->decrypt( $encrypted_array );

		return unserialize( $serialized_array );
	}

	/*
	* Sets the whole session ( dst_session ).
	*/
	private function set_session_cookie( $array = array() )
	{
		$serialized_array = serialize( $array );
		$encrypted_array = $this->encrypt( $serialized_array );

		set_cookie( "dst_session", $encrypted_array, $this->cookie_expiry );
	}
}