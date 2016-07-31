<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'DST_Controller';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

/*
| -------------------------------------------------------------------------
| GENERAL ACCESS ROUTES
| -------------------------------------------------------------------------
*/
	$route['login'] = "DST_Controller/login_page";
	$route['validate_login'] = "DST_Controller/validate_login";
	$route['logout'] = "DST_Controller/logout";

	$route['signup'] = "DST_Controller/signup_page";
	$route['finish_signup'] = "DST_Controller/process_signup";
	$route['about'] = "DST_Controller/about_page";

/*
| -------------------------------------------------------------------------
| ADMIN ROUTES
| -------------------------------------------------------------------------
*/
	$route['admin'] = "DST_Controller/admin_index_page";
	$route['admin/diseases'] = "DST_Controller/admin_disease_page";
	$route['admin/markers'] = "DST_Controller/admin_marker_page";
	$route['admin/users'] = "DST_Controller/admin_users_page";
	
	$route['admin/get/(:any)'] = "DST_Controller/get_admin_json/$1";
	$route['admin/post/(:any)'] = "DST_Controller/post_admin_json/$1";

/*
| -------------------------------------------------------------------------
| USER ROUTES
| -------------------------------------------------------------------------
*/
	$route['user'] = "DST_Controller/user_index_page";
	$route['user/select'] = "DST_Controller/user_select_page";
	$route['user/upload'] = "DST_Controller/user_upload_page";
    $route['user/calculate'] = "DST_Controller/user_calculate_page";
	$route['user/results'] = "DST_Controller/user_result_page";

	$route['user/process_select_disease'] = "DST_Controller/process_select_disease";

	$route['user/get/(:any)'] = "DST_Controller/get_user_json/$1";
	$route['user/post/(:any)'] = "DST_Controller/post_user_json/$1";

