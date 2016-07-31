<?php defined('BASEPATH') OR exit('No direct script access allowed');

class DST_Database_Model extends CI_Model 
{
	public function __construct()
    {
        parent::__construct();
    }
	
	/*
	* Adds an entry to the main database (genomic_dst)
	*/
	public function add_entry( $array = NULL, $table = NULL )
	{
		$this->load->database();
		
		$this->db->insert( $table, $array );
		
		unset( $this->db );
		
		return TRUE;
	}
	
	/*
	* Edits an entry from the main database (genomic_dst)
	*/
	public function edit_entry( $array = NULL, $limiting_array = NULL , $table = NULL )
	{
		$this->load->database();
		
		//$this->db->replace( $table, $array );
		foreach( $array as $key => $value ) :
			$this->db->set( $key, $value );
		endforeach;
		foreach( $limiting_array as $key => $value ) :
			$this->db->where( $key, $value );
		endforeach;
		
		$this->db->update( $table );
		
		unset( $this->db );
		
		return TRUE;
	}
	
	/*
	* Deletes an entry from the main database (genomic_dst)
	*/
	public function delete_entry( $array = NULL, $table = NULL )
	{
		$this->load->database();
		
		$this->db->delete( $table, $array );
		
		unset( $this->db );
		
		return TRUE;
	}
	
	/*
	* Retieves an entry from the main database (genomic_dst);
	* returns an array of database rows.
	*/
	public function view_entry( $select_array = NULL, $limiting_array = NULL, $table )
	{
		$this->load->database();
		
		$select_string = implode( ",", $select_array );
		
		$this->db->select( $select_string );
		foreach( $limiting_array as $key => $value ) :
			$this->db->where( $key, $value );
		endforeach;
		$query = $this->db->get( $table );
		
		unset( $this->db );
		
		return $query;
	}
}