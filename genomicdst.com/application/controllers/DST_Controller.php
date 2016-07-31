<?php defined('BASEPATH') OR exit('No direct script access allowed');

class DST_Controller extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		
		if( $this->config->item( 'installed' ) === FALSE ) :
			redirect( base_url( 'install' ) );
		else:
		
			$this->load->model( 'DST_Access_Model' );
			$this->DST_Access_Model->check_user_access();
		
			if( uri_string() != "login" && uri_string() != NULL ) :
				$this->DST_Access_Model->set_login_error( NULL );
			endif;
			if( uri_string() != "signup" ) :
				$this->DST_Access_Model->set_signup_error( NULL );
			endif;
		endif;
	}

	public function index()
	{	
		$this->login_page();
	}

	private $page_variables;
	
	private function load_page()
	{
		if( sizeof( $this->page_variables ) === 0 ) :
			return;
		endif;
		
		if( !array_key_exists( 'page', $this->page_variables ) ) :
			$this->page_variables['page'] = "pages/login.inc";
		endif;
		if( !array_key_exists( 'page_title', $this->page_variables ) ) :
			$this->page_variables['page_title'] = "Genomic Disease Risk Coefficient Calculator";
		endif;
		if( !array_key_exists( 'show_sm_js', $this->page_variables ) ) :
			$this->page_variables['show_sm_js'] = FALSE;
		endif;
		if( !array_key_exists( 'show_pdf_js', $this->page_variables ) ) :
			$this->page_variables['show_pdf_js'] = FALSE;
		endif;
		if( !array_key_exists( 'page_type', $this->page_variables ) ) :
			$this->page_variables['page_type'] = "general";
		endif;
		if( !array_key_exists( 'nav', $this->page_variables ) ) :
			if( $this->page_variables['page_type'] === "admin" ) :
				$this->page_variables['nav'] = array( 
					"admin" => "Home",
					"admin/diseases" => "Disease Catalog", 
					"admin/users" => "User Catalog" 
				);
			endif;
		endif;
		
		$this->page_variables["host_addresses"] = $this->config->item( 'host_addresses' );
		
		$this->load->view( 'container.inc', $this->page_variables );
		
		$this->DST_Access_Model->set_previous_page( uri_string() );
	}
	
	public function login_page()
	{
		$this->page_variables['page'] = "pages/general/login.inc";
		$this->page_variables['page_title'] = "Genomic Disease Risk Coefficient Calculator";
		$this->page_variables['login_error'] = $this->DST_Access_Model->get_login_error();
		
		$this->load_page();
	}
	
		public function validate_login()
		{
			$email = $this->input->post( "user_email" );
			$password = $this->input->post( "user_password" );
			
			if( $this->DST_Access_Model->check_email( $email ) ) :
				if( $this->DST_Access_Model->check_password( $email, $password ) ) :
					if( $this->DST_Access_Model->check_status( $email ) ) :
			
						$this->DST_Access_Model->set_login_error();
						$this->DST_Access_Model->set_user_information( $email );

						$usertype = "user";
						if( $this->DST_Access_Model->is_admin( $email ) ) :
							$usertype = "admin";
						endif;

						redirect( base_url( $usertype ) );	
					else:
						$this->DST_Access_Model->set_login_error( $email, FALSE, TRUE );
					endif;
				else:
					$this->DST_Access_Model->set_login_error( $email, TRUE );
				endif;
			else :
				$this->DST_Access_Model->set_login_error( $email );
			endif;
			
			redirect( base_url() );
		}
	
	public function logout()
	{
		$this->DST_Access_Model->logout_user();
		redirect( base_url() );
	}
	
	public function signup_page()
	{
		$this->page_variables['page'] = "pages/general/signup.inc";
		$this->page_variables['page_title'] = "Sign Up - Genomic Disease Risk Coefficient Calculator";
		$this->page_variables['signup_error'] = $this->DST_Access_Model->get_signup_error();
		
		$this->load_page();
	}
	
		public function process_signup()
		{
			$unit_name = $this->input->post( "name" );
			$email = $this->input->post( "email" );
			$password = $this->input->post( "password" );
			$password_retype = $this->input->post( "password_retype" );
			
			if( !$this->DST_Access_Model->check_email( $email ) ) :
				
				if( $password === $password_retype ) :
					
					$this->DST_Access_Model->set_signup_error();
			
					if( $this->DST_Access_Model->create_new_user( $unit_name, $email, $password ) ) :
						redirect( base_url() );
					else:
						$this->DST_Access_Model->set_signup_error( $unit_name, $email, TRUE );
					endif;
			
				else:
					$this->DST_Access_Model->set_signup_error( $unit_name, $email );
				endif;
			
			else:
				$this->DST_Access_Model->set_signup_error( $unit_name );
			endif;
			
			redirect( base_url( 'signup' ) );
		}
	
	public function about_page()
	{
		$this->page_variables['page'] = "pages/general/about.inc";
		$this->page_variables['page_title'] = "About - Genomic Disease Risk Coefficient Calculator";
		
		$this->load_page();
	}
	
	public function admin_index_page()
	{
		$this->page_variables['page'] = "pages/admin/home.inc";
		$this->page_variables['page_title'] = "Admin - Genomic Disease Risk Coefficient Calculator";
		$this->page_variables['page_type'] = "admin";
		
		$this->load_page();
	}
	
		public function admin_disease_page()
		{
			$this->page_variables['page'] = "pages/admin/diseases.inc";
			$this->page_variables['page_title'] = "Diseases - Genomic Disease Risk Coefficient Calculator";
			$this->page_variables['page_type'] = "admin";
			$this->page_variables['show_sm_js'] = TRUE;
			
			$this->load_page();
        }

		public function admin_users_page()
		{
			$this->page_variables['page'] = "pages/admin/users.inc";
			$this->page_variables['page_title'] = "Users - Genomic Disease Risk Coefficient Calculator";
			$this->page_variables['page_type'] = "admin";
			$this->page_variables['show_sm_js'] = TRUE;
			
			$this->load_page();
		}
	
	public function user_index_page()
	{
		$this->page_variables['page'] = "pages/user/home.inc";
		$this->page_variables['page_title'] = "Genomic Disease Risk Coefficient Calculator";
		$this->page_variables['page_type'] = "user";
		
		$this->load_page();
	}
	
		public function user_select_page()
		{
			$this->page_variables['page'] = "pages/user/select.inc";
			$this->page_variables['page_title'] = "Select Disease - Genomic Disease Risk Coefficient Calculator";
			$this->page_variables['page_type'] = "user";

			$this->load_page();
		}
	
			public function process_select_disease()
			{
                $disease_name = $this->input->post( "selected_disease" );
                
                $this->DST_Access_Model->set_selected_disease_name( $disease_name ) ;
                
                $this->load->model( 'DST_Dataset_Model' );
                $table_name = $this->DST_Dataset_Model->retrieve_disease_id( $disease_name );
				
                $this->DST_Access_Model->set_retrieve_marker_table( $table_name );
                
                $this->DST_Access_Model->set_upload_state( TRUE );
                
                redirect( base_url( "user/upload" ) );
			}

		public function user_upload_page()
		{
			$this->page_variables['page'] = "pages/user/upload.inc";
			$this->page_variables['page_title'] = "Select Disease - Genomic Risk Coefficient Calculator";
			$this->page_variables['page_type'] = "user";
			$this->page_variables['show_sm_js'] = TRUE;

			$this->load_page();
		}

		public function user_calculate_page()
		{
			$this->page_variables['page'] = "pages/user/retrieve.inc";
			$this->page_variables['page_title'] = "Results - Genomic Disease Risk Coefficient Calculator";
			$this->page_variables['page_type'] = "user";
			$this->page_variables['show_sm_js'] = TRUE;
            
            $this->DST_Access_Model->set_upload_state( TRUE );

			$this->load_page();
		}
    
        public function user_result_page()
        {
            $this->page_variables['page'] = "pages/user/generate.inc";
			$this->page_variables['page_title'] = "Generate PDF - Genomic Disease Risk Coefficient Calculator";
			$this->page_variables['page_type'] = "user";
			$this->page_variables['show_pdf_js'] = TRUE;
            
            $this->DST_Access_Model->set_upload_state( FALSE );

			$this->load_page();
        }
	
	public function get_admin_json( $variable = NULL )
	{
		if( $variable !== NULL ) :
			
			$this->load->model( 'DST_Dataset_Model' );
			switch( $variable ) :
                case "home":
                    $data = $this->DST_Dataset_Model->retrieve_admin_homepage();
                    break;
				case "diseases": 
					$data = $this->DST_Dataset_Model->retrieve_disease_list();
					break;
				case "users":
					$data = $this->DST_Dataset_Model->retrieve_user_list();
					break;
			endswitch;
		
			$this->output
				->set_content_type( "application/json" )
				->set_output( json_encode( $data ) );
		
		endif;
	}
	
	public function post_admin_json( $variable = NULL )
	{
		if( $variable !== NULL ) :
		
			$array = json_decode( trim( file_get_contents( 'php://input' ) ), true );
		
            $log_message = "";
        
			$this->load->model( 'DST_Dataset_Model' );
			switch( $variable ) :
                case "update_log":
                    $data = $this->DST_Dataset_Model->update_activity_log( $array );
                    break;
				case "add_disease":
					$data = $this->DST_Dataset_Model->add_disease_name( $array );
                    $log_message = "Add Disease - ".$data["alert"]["msg"];
					break;
				case "edit_disease":
					$data = $this->DST_Dataset_Model->edit_disease_name( $array );
                    $log_message = "Edit Disease - ".$data["alert"]["msg"];
					break;
				case "delete_disease":
					$data = $this->DST_Dataset_Model->delete_disease_name( $array );
                    $log_message = "Delete Disease - ".$data["alert"]["msg"];
					break;
				case "add_marker":
					$data = $this->DST_Dataset_Model->add_disease_marker( $array );
                    $log_message = "Add Marker - ".$data["alert"]["msg"];
					break;
                case "add_batch_marker":
                    $data = $this->DST_Dataset_Model->add_disease_marker_batch( $array );
                    $log_message = "Add Marker - ".$data["alert"]["msg"]; 
                    break;
				case "edit_marker":
					$data = $this->DST_Dataset_Model->edit_disease_marker( $array );
                    $log_message = "Edit Marker - ".$data["alert"]["msg"];
					break;
				case "delete_marker":
					$data = $this->DST_Dataset_Model->delete_disease_marker( $array );
                    $log_message = "Delete Marker - ".$data["alert"]["msg"];
					break;
				case "edit_user":
					$data = $this->DST_Dataset_Model->edit_system_user( $array );
                    $log_message = "Edit User - ".$data["alert"]["msg"];
					break;
				case "delete_user":
					$data = $this->DST_Dataset_Model->delete_system_user( $array );
                    $log_message = "Delete User - ".$data["alert"]["msg"];
					break;
			endswitch;
		
		endif;
		
		if( isset( $data ) ) :
        
            if( $variable != "update_log" ) :
                $this->DST_Dataset_Model->set_log_activity( $log_message );
            endif;
        
			$this->output
				->set_content_type( "application/json" )
				->set_output( json_encode( $data ) );
		endif;
	}
	
	public function get_user_json( $variable = NULL )
	{
		if( $variable !== NULL ) :
			
			$this->load->model( 'DST_Dataset_Model' );
			switch( $variable ) :
                case "home":
                    $data = $this->DST_Dataset_Model->retrieve_user_homepage();
                    break;
				case "diseases": 
					$data = $this->DST_Dataset_Model->retrieve_disease_selection_list();
					break;
                case "upload":
                    $data = $this->DST_Dataset_Model->retrieve_upload_information();
                    break;
                case "retrieve":
                    $data = $this->DST_Dataset_Model->retrieve_computation_table_names();
                    break;
                case "retrieve_multiplier":
                    $data = $this->DST_Dataset_Model->retrieve_weight_multiplier();
                    break;
			endswitch;
        
			$this->output
				->set_content_type( "application/json" )
				->set_output( json_encode( $data ) );
		
		endif;
	}
	
	public function post_user_json( $variable = NULL )
	{
		if( $variable !== NULL ) :
		
			$array = json_decode( trim( file_get_contents('php://input') ), true );
		
			$this->load->model( 'DST_Dataset_Model' );
			switch( $variable ) :
                case "upload_time":
                    $data = $this->DST_Dataset_Model->set_latest_upload_time( $array );
                    break;
                case "update_log":
                    $data = $this->DST_Dataset_Model->update_activity_log( $array );
                    break;
			endswitch;
		
		endif;
		
		if( isset( $data ) ) :
			$this->output
				->set_content_type( "application/json" )
				->set_output( json_encode( $data ) );
		endif;
	}
}