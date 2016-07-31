<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
* ---------------------------------
* INSTALLATION CONFIG FLAG
* ---------------------------------
*
* When set to false, the page will redirect to the install page;
* triggered only once.
*/
$config['installed'] = FALSE;

/*
* ---------------------------------
* DATABASE CONFIG VALUES
* ---------------------------------
*
* ['hostname'] The hostname of your database server.
* ['username'] The username used to connect to the database
* ['password'] The password used to connect to the database
* ['database'] The name of the database you want to connect to
*/

$config["db"]["hostname"] = '';
$config["db"]["username"] = '';
$config["db"]["password"] = '';
$config["db"]["database"] = '';

/*
* ---------------------------------
* MAIN CONFIG VALUES
* ---------------------------------
*
* URL to your CodeIgniter root. Typically this will be your base URL,
* WITH a trailing slash:
*/

$config['base_url'] = '';

/*
* ---------------------------------
* CUSTOM CONFIG VALUES
* ---------------------------------
* 
* cookie_expiry
*	- defines how long the cookie will last (in seconds)
*
* hash_algorithm
*	- utilizes the algorithms present in the crypt() function in PHP hashing
*	- http://php.net/manual/en/function.crypt.php
*
* hash_cost
* 	- defines the cost used to perform the crypt() function
*	- http://php.net/manual/en/function.crypt.php
*
* admin_email
*	- defines the admin email
*
* admin_name
* 	- defines the admin username
*
* weight_integer_multiplier
*	- defines the base 10 multiplier of the weight which moves the 
*	decimal point of the natural logarithm value of the odds ratio (weight)
*/

$config['cookie_expiry'] 				= intval( '0' ); 				

$config['hash_algorithm'] 				= '$2a$';	// BLOWFISH ALGORITHM
$config['hash_cost'] 					= '10'; 	// 2^10

$config['admin_name'] 					= ''; 
$config['admin_email'] 					= ''; 

$config['weight_integer_multiplier'] 	= intval( 0 );

$config['host_addresses']				= '';