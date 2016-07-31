<?php define( 'ACCESS', true );

    require_once('includes/core_class.php');
    $core = new Core();

    error_reporting(0);

    $main_config_path = '../application/config/config.local.php';
	$install_state = $core->get_state();

    if( $_POST ) :

		require_once('includes/database_class.php');
		$database = new Database();

        if( $install_state == "-1" ):

            if( !in_array('mod_rewrite', apache_get_modules()) ) :

                $message = "mod_rewrite is not enabled! Please enable it using the provided instructions.";

            elseif( !function_exists("mcrypt_encrypt") && !isset( $message ) ) :

                $message = "mcrypt module is not loaded! Please enable it using the provided instructions.";

            endif;

		elseif( $install_state == "0" ) :

			if( !is_writable($main_config_path) ) :
				
				$message = "The local configuration file is not yet writable. ". 
                            "Please chmod application/config/config.php file to 777";
			endif;

		elseif( $install_state == "1" ) :

			if( $core->validate_main_config( $_POST ) == false ) :

				$message = "Please fill up all CodeIgniter config form fields";
			
			elseif( $core->write_config( $_POST, "main", $main_config_path ) == false && 
                    !isset( $message ) ) :
            
                $message = "The local configuration file could not be written. ". 
                            "Please chmod application/config/config.local.php file to 777";
            endif;

		elseif( $install_state == "2" ) :

			if( $core->validate_db_config( $_POST ) == false ) :

				$message = "Please fill up all database form fields";

			elseif( $database->test_db_connection( $_POST ) == false && 
				    !isset( $message ) ) :

				$message = "Could not connect to database. Please check you settings.";

			elseif( $database->create_database( $_POST ) == false && 
                    !isset( $message ) ) :
            
                $message = "The database could not be created. ".
                            "Please verify your settings.";
            
            elseif( $database->create_tables( $_POST ) == false && 
                    !isset( $message ) ) :
            
                $message = "The database tables could not be created. ". 
                            "Please verify your settings.";

			elseif( $core->write_config( $_POST, "db", $main_config_path ) == false && 
                    !isset( $message ) ) :

				$message = "The local configuration file could not be written. ". 
                            "Please chmod application/config/config.php file to 777";
			endif;

		elseif( $install_state == "3" ) :

			if( $core->validate_admin_config( $_POST ) == false ) :

				$message = "Please fill up all admin form fields";

			elseif( $core->check_admin_password( $_POST ) == false ) :

				$message = "Passwords are not the same. Please re-enter password.";

			elseif( $database->create_admin( $_POST ) == false && 
                    !isset( $message ) ) :

                $message = "Admin account cound not be created. ".
                            "Please check your configuration.";

			elseif( $core->write_config( $_POST, "admin", $main_config_path ) == false && 
                    !isset( $message ) ) :

				$message = "The local configuration file could not be written. ". 
                            "Please chmod application/config/config.php file to 777";
			endif;

		elseif( $install_state == "4" ) :

			if( $core->validate_hosts_config( $_POST ) == false ) :

				$message = "Please fill up all host form fields";

			elseif( $core->write_config( $_POST, "hosts", $main_config_path ) == false && 
                    !isset( $message ) ) :

				$message = "The local configuration file could not be written. ". 
                            "Please chmod application/config/config.php file to 777";
			endif;

		elseif( $install_state == "5" ) :
	
			if( is_writable($main_config_path) ) :
				
				$message = "The local configuration file is still writable. ". 
                            "Please chmod application/config/config.php file to 755";
			endif;

		endif;


		if( !isset($message) ) :
	
			$install_state = (string)(intval( $install_state ) + 1);

			if( $install_state != "6" ) :
				$core->set_state( $install_state );
			else:
				$core->delete_state();
			endif;
		endif;
        
    endif;
?>

<!doctype html>
<html>

<head>
    
    <title>Install | Genomic Disease Risk Coefficient Calculator</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
 
    <link rel="stylesheet" type="text/css" href="../assets/css/foundation/foundation.min.css">
 
    <style>
    
    body {
        background-color: #fafafa;
    }

    form {
        margin: 3rem auto;
    }
		
    .contents {
        background-color: #fff;
        padding: 2rem;
        border: 1px solid #cacaca;
        border-radius: 3px;
    }
    .no-margin {
        margin: 0 !important;        
    }
    .no-margin-bottom {
        margin-bottom: 0 !important;
    }
	.no-margin-top {
		margin-top: 0rem !important;		
	}
    .header,
    .row {
        margin-bottom: 1.5rem;
    }
    .row:last-child{
        margin-bottom: 0;        
    }
    .error {
        padding: 1rem;
        margin: 1rem;
        background-color: #F08080;
    }
    pre code {
        display: block;
        overflow-x: auto;
        padding: 0.5rem 1rem;
        background: #f9f9f9;
        margin-bottom: 1.5rem;
    }

    .bash {
        border: 0;
        background: #333;
        color: white !important;
        border-radius: 4px;
        position: relative;
        padding-top: 2rem;
    }
    .bash::before {
        content: '$ ';
        color: #ccc;
    }
    .bash::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1.25rem;
        background: #777;
        border-radius: 4px 4px 0 0;
    }
    blockquote * {
        color: #000000 !important;
    }
    
    </style>
 
</head>

<body>
    
	<form id="install_form" 
              method="post" 
              action="<?php echo $_SERVER['PHP_SELF']; ?>">
        
        <div class="row">
            <h3 class="small-12 columns text-center header">
                Install Genomic Risk Coefficient Calculator
            </h3>
        </div>
    
			<?php if(isset($message)) : ?> 
				<div class="row">
					<div class="small-6 columns small-centered">
						<p class="error no-margin"> <?=$message?> </p>
					</div>
				</div>
			<?php endif; ?>
            
			<div class="row columns">
                <div class="small-6 columns small-centered">
					<div class="contents clearfix">

                    <?php if( $install_state == "-1" ) : ?>

                        <input type="hidden"
							   name="noop"
							   value="noop">

                        <h5>Step 1: Prerequisites</h5>
                        <hr>
                        <p>Make sure that the following are enabled/installed:</p>
                        <ol>
                            <li>
                                </p><code>mod_rewrite</code></p>
                                <blockquote>
                                    <p>This Apache module is used by the system in its routing function. Make sure to have the rewrite for the whole project directory enabled.</p>
                                    <p>To enable Apache's mod_rewrite module, run the following line in the terminal:</p>
                                    <pre><code class="bash">a2enmod rewrite</code></pre>
                                    <p>Then, for Linux servers hosting in <code>/var/www/</code>, make sure <code>AllowOverride All</code> is set in <code>/etc/apache2/apache2.conf</code>:</p>
                                    <p>
<pre><code class="no-margin-bottom">...
&lt;Directory /var/www/>
    Options Indexes FollowSymLinks
    AllowOverride <strong>All</strong>
    Require all granted
&lt;/Directory>
...</code></pre>
                                    </p>
                                </blockquote>
                            </li>
                            <li>
                                <p><code>php5-mcrypt</code></p>
                                <blockquote>
                                    <p>If the mcrypt module of PHP is not yet installed in ypur server, run the following line in the terminal:</p>
                                    <pre><code class="bash  no-margin-bottom">apt-get install php5-mcrypt</code></pre>
                                </blockquote>
                            </li>
                            <li>
                                <p>Lastly, restart the apache server:</p>
                                <pre><code class="bash">sudo service apache2 restart</code></pre>
                            </li>
                        </ol>
                        <hr>
						<button class="button float-right no-margin-bottom"
								type="submit">Next</button>

					<?php elseif( $install_state == "0" ) : ?>
						
						<input type="hidden"
							   name="noop"
							   value="noop">
						
						<h5>Step 2: Start Installation</h5>
						<hr>
						<p>Please make the application/config/config.local.php file writable.</p>
						<p>Example:</p>
						<p><code>chmod 777 application/config/config.local.php</code></p>
						<hr>
						<button class="button float-right no-margin-bottom"
								type="submit">Next</button>
						
					<?php elseif( $install_state == "1" ) : ?>

						<h5>Step 3: CodeIgniter Configuration</h5>

						<hr>

						<div class="input-group">
							<label class="input-group-label" 
								   for="main_base_url">
								Base URL
							</label>
							<input type="text" 
								   id="main_base_url" 
								   class="input-group-field" 
								   name="main_base_url"
								   value="<?=(($_POST["main_base_url"]) ? $_POST["main_base_url"] : 
                                   'http://'.$_SERVER['HTTP_HOST'].'/genomicdst.com/'); ?>"
								   required>
						</div>

						<button class="button float-right no-margin-bottom">Next</button>
					
					<?php elseif(  $install_state == "2" ) : ?>

						<h5>Step 4: Database Configuration</h5>

                        <hr>

                        <div class="input-group">
                            <label class="input-group-label" 
                                   for="db_hostname">
                                Hostname
                            </label>
                            <input type="text" 
                                   id="db_hostname" 
                                   class="input-group-field" 
                                   name="db_hostname"
                                   value="<?=(($_POST["db_hostname"]) ? $_POST["db_hostname"] : $_SERVER['HTTP_HOST'] ); 
                                   ?>"
                                   required>
                        </div>

                        <div class="input-group">
                            <label class="input-group-label"
                                   for="db_username">
                                Username
                            </label>
                            <input type="text" 
                                   id="db_username" 
                                   class="input-group-field" 
                                   name="db_username"
                                   value="<?=(($_POST["db_username"]) ? $_POST["db_username"] : ''); ?>"
                                   required>
                        </div>

                        <div class="input-group">
                            <label class="input-group-label"
                                   for="db_password">
                                Password
                            </label>
                            <input type="password" 
                                   id="db_password" 
                                   class="input-group-field" 
                                   name="db_password"
                                   value="<?=(($_POST["db_password"]) ? $_POST["db_password"] : ''); ?>"
                                   required>
                        </div>

                        <div class="input-group">
                            <label class="input-group-label"
                                   for="db_database">
                                Database Name
                            </label>
                            <input type="text" 
                                   id="db_database" 
                                   class="input-group-field" 
                                   name="db_database"
                                   value="<?=(($_POST["db_database"]) ? $_POST["db_database"] : ''); ?>"
                                   required>
                        </div>

						<button class="button float-right no-margin-bottom"
								type="submit">Next</button>
					
					<?php elseif(  $install_state == "3" ) : ?>

						<h5>Step 5: Admin Account Configuration</h5>

						<hr>

                        <input type="hidden" 
                               name="db_hostname"
                               value="<?=(($_POST["db_hostname"]) ? $_POST["db_hostname"] : $_SERVER['HTTP_HOST'] ); ?>"
                               required>

                        <input type="hidden" 
                               name="db_username"
                               value="<?=(($_POST["db_username"]) ? $_POST["db_username"] : ''); ?>"
                               required>

                        <input type="hidden" 
                               name="db_password"
                               value="<?=(($_POST["db_password"]) ? $_POST["db_password"] : ''); ?>"
                               required>

                        <input type="hidden" 
                               name="db_database"
                               value="<?=(($_POST["db_database"]) ? $_POST["db_database"] : ''); ?>"
                               required>
						
						<div class="input-group">
							<label class="input-group-label"
								   for="custom_admin_name">
								Admin name
							</label>
							<input type="text" 
								   id="custom_admin_name" 
								   class="input-group-field" 
								   name="custom_admin_name"
								   value="<?=(($_POST["custom_admin_name"]) ? $_POST["custom_admin_name"] : 'Research Group'); ?>"
								   required>
						</div>
                            
                            <div class="input-group">
                                <label class="input-group-label"
                                       for="custom_admin_email">
                                    Admin email
                                </label>
                                <input type="text" 
                                       id="custom_admin_email" 
                                       class="input-group-field" 
                                       name="custom_admin_email"
                                       value="<?=(($_POST["custom_admin_email"]) ? $_POST["custom_admin_email"] : 'admin@researchgroup.org'); ?>"
                                          required>
                            </div>
                            
                            <div class="input-group">
                                <label class="input-group-label"
                                       for="custom_admin_password">
                                    Admin password
                                </label>
                                <input type="password" 
                                       id="custom_admin_password" 
                                       class="input-group-field" 
                                       name="custom_admin_password"
                                       value="<?=(($_POST["custom_admin_password"]) ? 
                                       $_POST["custom_admin_password"] : ''); ?>"
                                       required>
                            </div>
						
							<div class="input-group">
                                <label class="input-group-label"
                                       for="custom_admin_password_retype">
                                    Retype password
                                </label>
                                <input type="password" 
                                       id="custom_admin_password_retype" 
                                       class="input-group-field" 
                                       name="custom_admin_password_retype"
                                       value="<?=(($_POST["custom_admin_password_retype"]) ? 
                                       $_POST["custom_admin_password_retype"] : ''); ?>"
                                       required>
                            </div>

						<button class="button float-right no-margin-bottom"
								type="submit">Next</button>

					<?php elseif(  $install_state == "4" ) : ?>

						<h5>Step 6: Sharemind Miner Configuration</h5>

                        <hr>
                        
                        <h6>Miner 1</h6>
                        <div class="input-group">
                            <label class="input-group-label"
                                   for="hosts_miner1_ip">
                                IP Address
                            </label>
                            <input type="text" 
                                   id="hosts_miner1_ip" 
                                   class="input-group-field" 
                                   name="hosts_miner1_ip"
                                   value="172.16.126.1"
                                   required>
                            <label class="input-group-label"
                                   for="hosts_miner1_port">
                                Port
                            </label>
                            <input type="text" 
                                   id="hosts_miner1_port" 
                                   class="input-group-field" 
                                   name="hosts_miner1_port"
                                   value="8001"
                                   required>
                        </div>
                        
                        <h6>Miner 2</h6>
                        <div class="input-group">
                            <label class="input-group-label"
                                   for="hosts_miner2_ip">
                                IP Address
                            </label>
                            <input type="text" 
                                   id="hosts_miner2_ip" 
                                   class="input-group-field" 
                                   name="hosts_miner2_ip"
                                   value="172.16.126.2"
                                   required>
                            <label class="input-group-label"
                                   for="hosts_miner2_port">
                                Port
                            </label>
                            <input type="text" 
                                   id="hosts_miner2_port" 
                                   class="input-group-field" 
                                   name="hosts_miner2_port"
                                   value="8002"
                                   required>
                        </div>
                        
                        <h6>Miner 3</h6>
                        <div class="input-group">
                            <label class="input-group-label"
                                   for="hosts_miner3_ip">
                                IP Address
                            </label>
                            <input type="text" 
                                   id="hosts_miner3_ip" 
                                   class="input-group-field" 
                                   name="hosts_miner3_ip"
                                   value="172.16.126.3"
                                   required>
                            <label class="input-group-label"
                                   for="hosts_miner3_port">
                                Port
                            </label>
                            <input type="text" 
                                   id="hosts_miner3_port" 
                                   class="input-group-field" 
                                   name="hosts_miner3_port"
                                   value="8003"
                                   required>
                        </div>

						<button class="button float-right no-margin-bottom"
								type="submit">Next</button>
						
					<?php elseif( $install_state == "5" ) : ?>
						
						<input type="hidden"
							   name="noop"
							   value="noop">
						
						<h5>Step 7: Finalize Installation</h5>
						<hr>
						<p>Revert back the local configuration file to its normal permission state.</p>
						<p>Example:</p>
						<p><code>chmod 755 application/config/config.local.php</code></p>
						<hr>
						
						<button class="button float-right no-margin-bottom"
								type="submit">Finish Installation</button>
						
                    <?php elseif( $install_state == "6" ) : ?>
						
						<input type="hidden"
							   name="noop"
							   value="noop">
						
						<h5>Step 8: Delete Installation Folder</h5>
						<hr>
                        <p>Delete the installation folder in the <code>/install</code> directory of the root
                            folder.</p>
						<hr>
						
						<a href="<?=$core->redirect();?>"
                           class="button float-right no-margin-bottom">Finish Installation</a>
                        
					<?php endif; ?>	
						
					</div>
				</div>
			</div>
			
	</form>
    
</body>

</html>
