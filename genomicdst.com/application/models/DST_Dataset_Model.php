<?php defined('BASEPATH') OR exit('No direct script access allowed');

class DST_Dataset_Model extends DST_Database_Model 
{	
	private $weight_integer_multiplier;
	
	public function __construct()
    {
        parent::__construct();
		
		$this->weight_integer_multiplier = $this->config->item( "weight_integer_multiplier" );
    }
	
/* 
| -------------------------------------------------------------------------
| PRIVATE METHODS
| -------------------------------------------------------------------------
*/
	
	/*
	* Retrieves the list of disease in the research group's database;
	* returns an array
	*/
	private function retrieve_raw_disease_list( $reverse_sorted = FALSE )
	{
		$query = $this->view_entry(
			array( "disease_id, disease_name" ),
			array(),
			"diseases"
		);
		
		$array = array();
		foreach( $query->result( "array" ) as $row ) :
			if( !$reverse_sorted ) :
				array_push( $array, $row );
			else :
				array_unshift( $array, $row );
			endif;
		endforeach;
		
		return array( "diseases" => $array );
	}
	
	/*
	* Retieves the list of disease markers in the database;
	* returns an array
	*/
	private function retrieve_raw_marker_list( $reverse_sorted = FALSE )
	{
		$query = $this->view_entry(
			array( "marker_id", "disease_id", "chromosome", "position", "risk_snp", "odds_ratio" ),
			array(),
			"markers"
		);
		
		$array = array();
		foreach( $query->result( "array" ) as $row ) :
			if( !$reverse_sorted ) :
				array_push( $array, $row );
			else :
				array_unshift( $array, $row );
			endif;
		endforeach;
		
		return array( "markers" => $array );
	}
	

	
	/*
	* Retrieves the list of users in the research group's database;	
	* returns an array
	*/
	private function retrieve_raw_user_list( $reverse_sorted = FALSE )
	{
		$query = $this->view_entry(
			array( "unit_id", "unit_name", "email", "password", "status" ),
			array(),
			"users"
		);
		
		$array = array();
		foreach( $query->result( "array" ) as $row ) :
			if( !$reverse_sorted ) :
				array_push( $array, $row );
			else :
				array_unshift( $array, $row );
			endif;
		endforeach;
		
		return array( "users" => $array );
	}
	
	/*
	* Checks if an existing disease name is present in the database.
	* Case-insensitive.
	*/
	private function has_disease_name( $name, $case_sensitive = FALSE, $disease_id = NULL )
	{
        $entries = 
            $this->DST_Database_Model->view_entry( 
                array( 'disease_id, disease_name' ), 
                array(), 
                'diseases' 
            );
		
		foreach( $entries->result( "array" ) as $value ):
			if( $case_sensitive ) :
				if( $value["disease_name"] == $name ) :
                    if( $disease_id != $value["disease_id"] ) :
					   return TRUE;
                    endif;
				endif;
			else :
				if( strtolower( $value["disease_name"] ) == strtolower( $name ) ) :
                    if( $disease_id != $value["disease_id"] ) :
                        return TRUE;
                    endif;
				endif;
			endif;
		endforeach;
		
		return FALSE;
	}
	
	/*
	* Checks if a disease marker for a particular disease 
	* is already listed in the database by checking the
	* chromosome, position, and the risk snp.
	*/
	private function has_disease_marker( $id = NULL, $array = NULL )
	{
		if( isset( $id ) ) :
		
			$entries = 
				$this->DST_Database_Model->view_entry( 
					array( "marker_id" ), 
					array( "marker_id" => $id ), 
					"markers"
				);

			if( sizeof($entries->row()) !== 0 ) :
				return ( $id == $entries->row()->marker_id );
			endif;
			return FALSE;
		
		elseif( isset( $array ) ) :
		
			$entries = 
				$this->DST_Database_Model->view_entry( 
					array( "marker_id" ), 
					array( 
						"disease_id" => $array["disease_id"],
						"chromosome" => $array["chromosome"],
						"position" => $array["position"]
					), 
					"markers" 
				);
		
			return ( sizeof($entries->row()) !== 0 );
		
		endif;
	}
	
	/*
	* Checks if entities are valid disease marker entities
	*/
	private function validate_disease_marker( $chromosome, $position, $risk_snp, $odds_ratio )
	{
		if( intval( $chromosome ) <= 0 || intval( $chromosome ) > 22 ) :
			return FALSE;
		endif;
		
		if( intval( $position ) <= 0 || intval( $position ) > 999999999 ) :
			return FALSE;
		endif;
		
		if( !in_array( strtoupper( $risk_snp ), array( "A", "C", "T", "G" ) ) ) :
			return FALSE;
		endif;
		
		if( floatval( $odds_ratio ) <= 0 || floatval( $odds_ratio ) > 9.99 ) :
			return FALSE;
		endif;
		
		return TRUE;
	}
	
	/*
	* Checks if the user is present in the database.
	*/
	private function has_system_user( $id )
	{
		$entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'unit_id' ), 
				array( 'unit_id' => $id ), 
				'users' 
			);
		
		if( sizeof($entries->row()) !== 0 ) :
			return ( $id == $entries->row()->unit_id );
		endif;
		return FALSE;
	}
	
    /*
    * Checks if the user email is present in the database
    */
    private function has_system_user_email( $email )
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
    * Sets a log for any user activities by inserting into database
    */
    public function set_log_activity( $message )
    {
        $array = 
            array(
                "timestamp" => date('Y-m-d H:i:s'),
                "message" => $message
            );
        
        $unit_id = $this->DST_Access_Model->get_user_information()["unit_id"];
        $content = base64_encode( json_encode( $array ) );
        
        $this->add_entry(
            array( 
                "unit_id" => $unit_id,
                "content" => $content 
            ),
            "log"
        );
    }
    
    /*
    * Gets a set of log activities by defining a bound
    */
    private function get_log_activities( $start, $end )
    {
        $user_id = $this->DST_Access_Model->get_user_information()["unit_id"];
        
        $entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'content' ), 
				array( 'unit_id' => $user_id ), 
				'log' 
			);
        $results = $entries->result( "array" );
        $results_size = sizeof( $results );
        
        $results = array_reverse( $results );
        
        $array = array();
        $max =  ( $end > $results_size ) ? $results_size : $end ;
        
        for( $i = $start; $i < $max; $i++ ) :
        
            $array_row = base64_decode( $results[$i]["content"] );
            $array_row = json_decode( $array_row, true );

            array_push( $array, $array_row );
        
        endfor;
        
		return array( "log" => $array );
    }
    
    /*
    * Updates the status of the retrieve table indicator in the database
    */
    private function update_table_status( $status, $timestamp = "0000/00/00 00:00:00 AM" )
    {
        $status = ( $status ) ? 1 : 0;
        $unit_id = $this->DST_Access_Model->get_user_information()["unit_id"];
       
        $table_id = 0;
        $disease_name = "";
        if( $status != 0 ) :
            $table_id = $this->DST_Access_Model->get_retrieve_marker_table();
            $disease_name = $this->DST_Access_Model->get_selected_disease_name();
        endif;
        
        $user_table_status = 
            array(
                "unit_id" => $unit_id,
                "table_id" => $table_id,
                "disease_name" => $disease_name,
                "timestamp" => $timestamp,
                "isset" => $status
            );
        
        return $this->DST_Database_Model->edit_entry( 
            $user_table_status, 
            array( "unit_id" => $unit_id ),
            "user_table_status" 
        );
    }
    
    /*
    * Gets the necessary database information from user table status table
    */
    private function get_user_table_status()
    {
        $user_id = $this->DST_Access_Model->get_user_information()["unit_id"];
           
        $entry = 
			$this->DST_Database_Model->view_entry( 
				array( 'table_id, disease_name, timestamp' ), 
				array( 'unit_id' => $user_id ), 
				'user_table_status' 
			)->row();
        
        return array(
            "marker_table" => $entry->table_id,
            "disease_name" => $entry->disease_name,
            "timestamp" => $entry->timestamp
        );
    }
    
    private function get_max_log_length()
    {
        $user_id = $this->DST_Access_Model->get_user_information()["unit_id"];
        
        $entries = 
			$this->DST_Database_Model->view_entry( 
				array( 'content' ), 
				array( 'unit_id' => $user_id ), 
				'log' 
			);
        $results = $entries->result( "array" );
        $results_size = sizeof( $results );
        
        return array( "max_log" => $results_size );
    }

    public function parse_marker_file( $file_string ) 
    {   
        try {
            
            $file_rows = explode( "\n", $file_string );

            $current_index = 0;
            while( strpos( $file_rows[$current_index], "##" ) !== FALSE ) :

                // GET HEADERS
                // OR - Odds Ratio
                // RS - Risk SNP

                $current_index++;
            endwhile;

            $columns = explode( "\t", $file_rows[$current_index] );

            $chrom_index = NULL;
            $pos_index = NULL;
            $ref_index = NULL;
            $alt_index = NULL;
            $format_index = NULL;
            $sample_index = NULL;

            for( $i = 0; $i < sizeof( $columns ); $i++ ) :
                if( strpos( $columns[$i], "CHROM" ) !== FALSE ) :
                    $chrom_index = $i;
                elseif( strpos( $columns[$i], "POS" ) !== FALSE ) :
                    $pos_index = $i;
                elseif( strpos( $columns[$i], "REF" ) !== FALSE ) :
                    $ref_index = $i;
                elseif( strpos( $columns[$i], "ALT" ) !== FALSE ) :
                    $alt_index = $i;
                elseif( strpos( $columns[$i], "FORMAT" ) !== FALSE ) :
                    $format_index = $i;
                    $sample_index = $format_index + 1;
                    break;
                endif;
            endfor;

            if( $chrom_index === NULL ) :
                throw new Exception( "No CHROM column specified!" );
            endif;
            if( $pos_index === NULL ) :
                throw new Exception( "No POS column specified!" );
            endif;
            if( $ref_index === NULL ) :
                throw new Exception( "No REF column specified!" );
            endif;
            if( $alt_index === NULL ) :
                throw new Exception( "No ALT column specified!" );
            endif;
            if( $format_index === NULL ) :
                throw new Exception( "No FORMAT column specified!" );
            endif;
            if( $sample_index === NULL ) :
                throw new Exception( "No <+SAMPLE> column specified!" );
            endif;

            $current_index++;

            $markers = array();
            while( isset($file_rows[$current_index]) && strlen( preg_replace( "/\s+/", "", $file_rows[$current_index] ) ) > 0 ) :

                $file_row = explode( "\t", $file_rows[$current_index] );

                $marker["chromosome"] = $file_row[$chrom_index];
                $marker["position"] = $file_row[$pos_index];

                $risk_index = 0;
                $odds_index = 0;

                $temp_format = explode( ":", $file_row[$format_index] );
                if( strpos( $temp_format[0], "RS" ) !== FALSE ) :
                    $odds_index = 1;
                else :
                    $risk_index = 1;
                endif;

                $temp_sample = explode( ":", $file_row[$sample_index] );
                $marker["odds_ratio"] = $temp_sample[$odds_index];    

                $temp_ref = $file_row[$ref_index];
                $temp_alt = $file_row[$alt_index];
                $marker["risk_snp"] = ( $temp_sample[$risk_index] == "0" ) ? $temp_ref : $temp_alt ;

                array_push( $markers, $marker );

                $current_index++;

            endwhile;

            return $markers;   
        }
        catch ( Exception $e ) {
            return array( "error" => $e->getMessage() );
        }
    }
    
/* 
| -------------------------------------------------------------------------
| ADMIN GET METHODS
| -------------------------------------------------------------------------
*/	
    /*
    * Creates an array containing the list of elements the admin homepage needs;
    * returns a response array
    */
    public function retrieve_admin_homepage()
    {
        return array_merge( 
            array(
                "user_name" => $this->DST_Access_Model->get_user_information()["username"]
            ), 
            $this->get_log_activities( 0, 10 ),
            $this->get_max_log_length()
        );
    }
    
	/*
	* Creates a customized array for the disease page of the research group;
	* returns a response array
	*/
	public function retrieve_disease_list()
	{
		$diseases = array();
		foreach( $this->retrieve_raw_disease_list()["diseases"] as $row ) :
            array_unshift( $diseases, 
                array( 
                    "disease_id" => $row["disease_id"],
                    "disease_name" => $row["disease_name"], 
				    "old_disease_name" => $row["disease_name"],
				    "disabled" => true
				) 
            );
		endforeach;
		
        $markers = array();
		foreach( $this->retrieve_raw_marker_list()["markers"] as $row ) :
			array_push( $markers, $row );
		endforeach;
        
		return array_merge( 
            array( "diseases" => $diseases ),
            array( "markers" => $markers )
        );
	}
	
	/*
	* Creates a customized array for the users page of the research group;
	* does not include the account of the research group;
	* returns a response array
	*/
	public function retrieve_user_list()
	{
		$users = $this->retrieve_raw_user_list()["users"];
		
		$array = array();
		foreach( $users as $row ) :
			if( $row["unit_id"] != 1 ) :
				unset( $row["password"] );
				$row["status"] = ( $row["status"] == 0 ) ? array( "value" => false ) : array( "value" => true );
				$row["status"]["label"] = ( !$row["status"]["value"] ) ? "For Approval" : "Approved";
				array_unshift( $array, $row );
			endif;
		endforeach;
		
		return array( "users" => $array );
	}
	
/* 
| -------------------------------------------------------------------------
| ADMIN POST METHODS
| -------------------------------------------------------------------------
*/
	
	/*
	* Adds a new disease name in the disease table of the research group
	* returns a response array
	*/
	public function add_disease_name( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "disease_name", $array ) ) :
		
			$disease_name = $array["disease_name"];
			if( strlen( $disease_name ) !== 0 ) :
				if( !$this->has_disease_name( $disease_name ) ) :
        
                    $diseases =  $this->DST_Database_Model->view_entry(
                        array( "disease_id" ),
                        array(),
                        "diseases"
                    )->result( "array" );
        
					if( sizeof($diseases) != 0 ) :
                    	$disease_id = intval( $diseases[sizeof($diseases)-1]["disease_id"] ) + 2;
					else:
						$disease_id = 2;
        			endif;
		
					$this->add_entry(
						array( 
                            "disease_id" => $disease_id,
                            "disease_name" => $disease_name 
                        ),
						"diseases"
					);
					$type = "success";
					$message = "Disease \"{$disease_name}\" successfully added to database!";
        
				else :
					$message ="Disease name already in database!";
				endif;
			else :
				$message = "Disease name cannot be empty!";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array_merge( 
			array(
				"alert" => array(
					"type" => $type, 
					"msg" => $message
				)
			),
			$this->retrieve_disease_list()
		);
	}
	
	/*
	* Edits a particular disease name;
	* returns a response array
	*/
	public function edit_disease_name( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "disease", $array ) && 
		   	array_key_exists( "disease_name", $array["disease"] ) && 
		  	array_key_exists( "old_disease_name", $array["disease"] ) ) :
		
			$disease_name = $array["disease"]["disease_name"];
			$old_disease_name = $array["disease"]["old_disease_name"];
            $disease_id = $array["disease"]["disease_id"];
        
			if( $disease_name !== $old_disease_name ) :
				if( $this->has_disease_name( $old_disease_name, TRUE ) ) :
					
                    $this->edit_entry(
						array( "disease_name" => $disease_name ),
						array( "disease_id" => $disease_id ),
						"diseases"
					);
                    
                    if( $this->has_disease_name( $disease_name, TRUE, $disease_id ) ) :
                        
                        $this->edit_entry(
                            array( "disease_name" => $old_disease_name ),
                            array( "disease_id" => $disease_id ),
                            "diseases"
                        );
        
                        $type = "alert";
				        $message = "Disease \"{$disease_name}\" is already in database!";
        
                    else :
                        $type = "success";
				        $message = "Disease \"{$old_disease_name}\" successfully changed to \"{$disease_name}\"!";
                    endif;
				else :
					$message = "Disease \"{$old_disease_name}\" not found in the database!";
				endif;
			else :
				$type = "warning";
				$message = "Disease \"{$old_disease_name}\" has not been changed.";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array_merge( 
			array(
				"alert" => array(
					"type" => $type, 
					"msg" => $message
				)
			),
			$this->retrieve_disease_list()
		);
	}
	
	/*
	* Deletes a particular disease name;
	* returns a response array
	*/
	public function delete_disease_name( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "disease_name", $array ) ) :
		
			$disease_name = $array["disease_name"];
			if( $this->has_disease_name( $disease_name, TRUE ) ) :
		
				$this->delete_entry(
					array( "disease_name" => $disease_name ),
					"diseases"
				);
				$type = "success";
				$message = "Disease \"{$disease_name}\" successfully deleted from database!";
		
			else :
				$message ="Disease name not in database!";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array_merge(
            array(
                "alert" => array(
                    "type" => $type, 
                    "msg" => $message
                )
            ),
            $this->retrieve_raw_marker_list()
		);
	}
	
	/*
	* Adds a new disease marker in the disease marker table of the research group
	* returns a response array
	*/
	public function add_disease_marker( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "chromosome", $array ) &&
		   	array_key_exists( "position", $array ) &&
		   	array_key_exists( "risk_snp", $array ) &&
		   	array_key_exists( "odds_ratio", $array ) &&
		   	array_key_exists( "disease_id", $array ) ) :
		
			$chromosome = (string) $array["chromosome"];
			$position = (string) $array["position"];
			$risk_snp = $array["risk_snp"];
			$odds_ratio = (string) $array["odds_ratio"];
			$disease_id = (string) $array["disease_id"];
		
			if( strlen( $chromosome ) !== 0 &&
			   	strlen( $position ) !== 0 &&
			   	strlen( $risk_snp ) !== 0 &&
			   	strlen( $odds_ratio ) !== 0 &&
			   	strlen( $disease_id ) !== 0 ) :
		
				if( !$this->has_disease_marker( NULL, $array ) ) :
					
					if( $this->validate_disease_marker( $chromosome, $position, $risk_snp, $odds_ratio ) ) :
		
						$this->add_entry(
							array( 
								"disease_id" => intval( $disease_id ),
								"chromosome" => intval( $chromosome ),
								"position" => intval( $position ),
								"risk_snp" => strtoupper( $risk_snp ),
								"odds_ratio" => floatval( $odds_ratio ),
							),
							"markers"
						);
						$type = "success";
						$message = "Disease marker successfully added to database!";
		
					else:
						$message = "Please fill up the fields with appropriate values!";
					endif;
				else :
					$message = "Disease marker already listed in the disease! Just edit from below.";
				endif;
			else :
				$message = "Please fill up empty fields!";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array_merge( 
			array(
				"alert" => array(
					"type" => $type, 
					"msg" => $message
				)
			),
			$this->retrieve_raw_marker_list()
		);
	}
    
    /*
    * 
    */
    public function add_disease_marker_batch( $array )
    {
        $disease_id = $array["disease_id"];
        $markers = $this->parse_marker_file( $array["file"] );
        
        if( !array_key_exists( "error", $markers ) ) : 
            
            $counter = 0;
            foreach( $markers as $marker ) :
                $this->add_entry(
                    array( 
                        "disease_id" => intval( $disease_id ),
						"chromosome" => intval( $marker["chromosome"] ),
						"position" => intval( $marker["position"] ),
				        "risk_snp" => strtoupper( $marker["risk_snp"] ),
				        "odds_ratio" => floatval( $marker["odds_ratio"] ),
				    ),
				    "markers"
				);
                $counter++;
            endforeach;
            
            $type = "success";
            $message = $counter." markers suceessfully added to database!";
        
        else: 
            $type = "alert";
            $message = $markers["error"];
        endif;
        
        return array_merge(
            array(
                "alert" => array(
                    "type" => $type,
                    "msg" => $message
                )
            ),
            $this->retrieve_raw_marker_list()
        );
    }
	
	/*
	* Edits a particular disease marker of a particular disease;
	* returns a response array
	*/
	public function edit_disease_marker( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "marker", $array ) && 
		   	array_key_exists( "old", $array["marker"] ) && 
		  	array_key_exists( "new", $array["marker"] ) ) :
		
			$new_marker_information = $array["marker"]["new"];
			$old_marker_information = $array["marker"]["old"];
			
			if( $new_marker_information !== $old_marker_information ) :
				if( $this->has_disease_marker( $new_marker_information["marker_id"] ) ) :
					
					$chromosome = (string) $new_marker_information["chromosome"];
					$position = (string) $new_marker_information["position"];
					$risk_snp = $new_marker_information["risk_snp"];
					$odds_ratio = (string) $new_marker_information["odds_ratio"];
		
					if( isset( $chromosome ) && $chromosome != "" &&
					  	isset( $position ) && $position != "" &&
					  	isset( $risk_snp ) && $risk_snp != "" &&
					  	isset( $odds_ratio ) && $odds_ratio != "" ) :
		
						if( $this->validate_disease_marker( $chromosome, $position, $risk_snp, $odds_ratio ) ) :
		
							$this->edit_entry(
								array( 
									"chromosome" => intval( $chromosome ),
									"position" => intval( $position ),
									"risk_snp" => strtoupper( $risk_snp ),
									"odds_ratio" => floatval( $odds_ratio )
								),
								array( 
									"marker_id" => $new_marker_information["marker_id"],
									"disease_id" => $new_marker_information["disease_id"]
								),
								"markers"
							);
							$type = "success";
							$message = "Disease marker successfully edited!";
		
						else:
							$message = "Please fill up the fields with appropriate values!";
						endif;
					else :
						$message = "Please enter a value for all empty fields.";
					endif;
				else :
					$message = "Disease marker not found in the database!";
				endif;
			else :
				$type = "warning";
				$message = "Disease marker has not been changed.";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array_merge( 
			array(
				"alert" => array(
					"type" => $type, 
					"msg" => $message
				)
			),
			$this->retrieve_raw_marker_list()
		);
	}
	
	/*
	* Deletes a particular disease marker of a particular disease;
	* returns a response array
	*/
	public function delete_disease_marker( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "marker", $array ) &&
		  	array_key_exists( "marker_id", $array["marker"] ) && 
		  	array_key_exists( "disease_id", $array["marker"] ) ) :
		
			$variant_id = $array["marker"]["marker_id"];
			$disease_id = $array["marker"]["disease_id"];
			if( $this->has_disease_marker( $variant_id ) ) :
		
				$this->delete_entry(
					array( "marker_id" => $variant_id, "disease_id" => $disease_id ),
					"markers"
				);
				$type = "success";
				$message = "Disease marker successfully deleted from database!";
		
			else :
				$message ="Disease marker not found in database!";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array(
			"alert" => array(
				"type" => $type, 
				"msg" => $message
			)
		);
	}
	
	/*
	* Edits a particular system user (unit);
	* returns a response array
	*/
	public function edit_system_user( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "user", $array ) && 
		   	array_key_exists( "old", $array["user"] ) && 
		  	array_key_exists( "new", $array["user"] ) ) :
		
			$new_user_information = $array["user"]["new"];
			$old_user_information = $array["user"]["old"];
			
			if( $new_user_information !== $old_user_information ) :
        
				if( $new_user_information["email"] == $old_user_information["email"] ||
                    !$this->has_system_user_email( $new_user_information["email"] ) ) :
        
					if( $this->has_system_user( $new_user_information["unit_id"] ) ) :
        
                        $unit_name = $new_user_information["unit_name"];
                        $email = $new_user_information["email"];
                        $status = $new_user_information["status"]["value"];

                        if( isset( $unit_name ) && $unit_name != "" &&
                            isset( $email ) && $email != "" ) :

                            $this->edit_entry(
                                array( 
                                    "unit_name" => $unit_name,
                                    "email" => $email,
                                    "status" => ( ( $status ) ? "1" : "0" )
                                ),
                                array( "unit_id" => $new_user_information["unit_id"] ),
                                "users"
                            );
                            $type = "success";
                            $message = "User profile of \"{$old_user_information["unit_name"]}\" successfully edited!";

                        else :
                            $message = "Please enter a value for all empty fields.";
                        endif;
                    else :
                        $message = "User \"{$old_user_information["unit_name"]}\" not found in the database!";
                    endif;
                else:
                    $message = "Email already taken! Please select another one.";
                endif;
			else :
				$type = "warning";
				$message = "User profile has not been changed.";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array_merge( 
			array(
				"alert" => array(
					"type" => $type, 
					"msg" => $message
				)
			),
			$this->retrieve_user_list()
		);
	}
	
	/*
	* Deletes a system user;
	* returns a response array
	*/
	public function delete_system_user( $array )
	{
		$type = "alert";
		
		if( array_key_exists( "user", $array ) &&
		  	array_key_exists( "unit_id", $array["user"] ) ) :
		
			$unit_id = $array["user"]["unit_id"];
			if( $this->has_system_user( $unit_id ) ) :
		
				$this->delete_entry(
					array( "unit_id" => $unit_id ),
					"users"
				);
				$type = "success";
				$message = "User \"{$array["user"]["unit_name"]}\" successfully deleted from database!";
		
			else :
				$message ="User not in database!";
			endif;
		else:
			$message = "Something went wrong. Please try again.";
		endif;
		
		return array(
			"alert" => array(
				"type" => $type, 
				"msg" => $message
			)
		);
	}
	
/*
| -------------------------------------------------------------------------
| USER DATASET MODEL
| -------------------------------------------------------------------------
*/
    /*
    * Creates an array containing the list of elements the user homepage needs;
    * returns a response array
    */
    public function retrieve_user_homepage()
    {
         return array_merge( 
            array(
                "user_name" => $this->DST_Access_Model->get_user_information()["username"]
            ), 
            $this->get_log_activities( 0, 10 ),
            $this->get_max_log_length()
        );
    }
    
	/*
	* Creates a customized array for the disease selection page of a medical unit;
	* returns a response array
	*/
	public function retrieve_disease_selection_list()
	{
		$disease_list = $this->retrieve_raw_disease_list()["diseases"];
		
		$array = array();
		foreach( $disease_list as $row ) :
			unset( $row["disease_id"] );
			array_push( $array, $row );
		endforeach;
		
		return array( "diseases" => $array );
	}
	
	/*
	* A public function that retrieves the corresponding disease
    * id for a given disease name. The ID serves as the table name for
    * the disease markers in the Sharemind servers.
	*/
    public function retrieve_disease_id( $disease_name ) {
       
        if( $this->has_disease_name( $disease_name, TRUE ) ) :
            
            $disease_list = $this->retrieve_raw_disease_list()["diseases"];
        
            foreach( $disease_list as $row ) :
                if( $row["disease_name"] == $disease_name ) :
                    return $row["disease_id"];
                endif;
            endforeach;
        
        endif;
        return NULL;
    }
    
    /*
    * Retrieves the necessary info for the user to use in uploading
    * to the Sharemind servers.
    */
    public function retrieve_upload_information()
    {
        return array( 
            "unit_table_name" => $this->DST_Access_Model->get_user_information()["unit_id"]
        );
    }
    
    /*
    * Retrieves the computation table for the markers and
    * the unit.
    */
    public function retrieve_computation_table_names()
    {
        $retrieve_array = $this->get_user_table_status();
        
        return array(
            "unit_table_name" => $this->DST_Access_Model->get_user_information()["unit_id"],
            "marker_table_name" => $retrieve_array["marker_table"],
            "disease_name" => $retrieve_array["disease_name"],
            "upload_time" => $retrieve_array["timestamp"],
            "weight_multiplier" => $this->weight_integer_multiplier
        );
    }
    
    /*
	* Sets the upload time for the latest unit patient variant upload;
	* returns a response array
	*/
    public function set_latest_upload_time( $array )
    {
        // LOG ACTIVITY - VARIANT UPLOADED
        $this->set_log_activity( "Patient variants uploaded to Sharemind." );
        
        // UPDATE DATABASE OF TABLE STATUS
        $this->update_table_status( TRUE , $array["upload_time"] );
        
        return array(
			"alert" => array(
				"type" => "success", 
				"msg" => "Patient variants successfully added to Sharemind servers!"
			)
		);
    }
    
    /*
    * Retrieves the weight multiplier for the final coefficient calculation
    */
    public function retrieve_weight_multiplier()
    {
        // LOG ACTIVITY - RESULTS RETRIEVED
        $this->set_log_activity( "Risk coefficient result retrieved from Sharemind." );
        
        // UPDATE DATABASE OF TABLE STATUS
        $this->update_table_status( FALSE );
        
        return array( "weight_multiplier" => $this->weight_integer_multiplier );
    }
    
    
    public function update_activity_log( $array )
    {
        $start = $array["start"];
        $end = $array["end"];
        
        return $this->get_log_activities( $start, $end );
    }
}