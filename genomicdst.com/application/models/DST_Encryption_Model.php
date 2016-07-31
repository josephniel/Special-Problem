<?php defined('BASEPATH') OR exit('No direct script access allowed');

class DST_Encryption_Model extends CI_Model 
{
	// For hashing function
    private $hash_algo; 
    private $hash_cost; 
	
    public function __construct()
    {
        parent::__construct();
        
		/* LOADS CONFIGURATION ITEMS */
        $this->hash_algo = $this->config->item( 'hash_algorithm' ); 
        $this->hash_cost = $this->config->item( 'hash_cost' );
    }
    
    /*
    * Generate a unique salt to be put in the database 
    * for every registered user.
    */
    private function generate_unique_salt() 
	{
        return substr( sha1(mt_rand()), 0, 22 );
    }
    
    /*
    * Generate a hash value for the password using the
    * preset algorithm and cost. Used for newly made users.
    */
    public function generate_hash( $password ) 
	{
        return crypt( 
            $password, 
            $this->hash_algo . $this->hash_cost . '$' . $this->generate_unique_salt() 
        );
	}
	
	/*
	* Encrypts any data given a password using the CodeIgniter
	* encryption library utilizing the mcrypt PHP function.
	*/
	public function encrypt( $data )
    {
		$this->load->library( 'encrypt' );
        $ciphertext = $this->encrypt->encode( $data );
		unset( $this->encrypt );
		
		return base64_encode( $ciphertext );
    }
    
	/*
	* Decrypts any data given a password using the CodeIgniter
	* encryption library utilizing the mcrypt PHP function.
	*/
    public function decrypt( $data )
    {
		$data = base64_decode( $data );
		
		$this->load->library( 'encrypt' );
        $plaintext = $this->encrypt->decode( $data );
		unset( $this->encrypt );
		
		return $plaintext;
    }
}