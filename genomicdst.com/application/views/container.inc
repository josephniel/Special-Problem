<!doctype html>
<html lang="en">
<head>

	<title><?=$page_title?></title>	
	
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1, maximum-scale=1">
	
	<link rel="icon" type="image/png" href="<?=base_url('assets/images/favicon.ico')?>">
	
    <link rel="stylesheet" type="text/css" href="<?=base_url('assets/css/foundation/foundation.min.css')?>">	
    <link rel="stylesheet" type="text/css" href="<?=base_url('assets/css/foundation/foundation-icons.css')?>">	
    <link rel="stylesheet" type="text/css" href="<?=base_url('assets/css/app.css')?>">
	
</head>
<body ng-app="tuazon.genomicdst<?php if( $page_type == 'admin' ): ?>.admin<?php elseif( $page_type == 'user' ): ?>.user<?php endif; ?>">

	<?php if( $page_type === "general" ) : ?>
	
        <header class="general text-center">
            <h3><b>Genomic Disease Risk Coefficient Calculator</b></h3>
            <h6>Special Problem by <b>Joseph Niel Tuazon</b></h6>
        </header>

	<?php elseif( $page_type === "admin" ): ?>
	
        <section class="admin-topbar">
            <div class="wrapper">
                <a href="<?=base_url($page_type)?>">Genomic Disease Risk Coefficient Calculator</a>
                <a href="<?=base_url('logout')?>" class="logout button outline">Log out</a>
            </div>
        </section>

        <section class="sidebar">

            <div class="image">
                <img src="<?=base_url( 'assets/images/upm_logo.png' )?>">
            </div>

            <?php foreach( $nav as $url => $label ) : ?>

                <a href="<?=base_url($url)?>" 
                   class="line-height-32 clearfix button <?php if( uri_string() == $url ): echo 'active'; endif; if( uri_string() == 'user/upload' && $url == 'user/select' ) : echo 'active'; endif; ?>">
                    
                    <?php if( $label == "Home" ) : ?>
                        <i class="fi-home size-20 margin-right"></i>
                    <?php elseif( $label == "Disease Catalog" ) : ?>
                        <i class="fi-clipboard-notes size-20 margin-right"></i>
                    <?php elseif( $label == "User Catalog" ) : ?>
                        <i class="fi-torsos size-20 margin-right"></i>
                    <?php endif; ?>
                    
                    <?=$label?>
                    
                </a>

            <?php endforeach; ?>

            <span class="copyright">
                Copyright &copy; 2016
            </span>

        </section>
	
    <?php else: ?>
    
        <section class="user-topbar">
            <div class="wrapper">
                <a href="<?=base_url($page_type)?>">
                    <h4 class="fi-home margin-top margin-right float-left"></h4>
                </a>
                <span class="default-cursor no-select">Genomic Disease Risk Coefficient Calculator</span>
                <a href="<?=base_url('logout')?>" class="logout button outline">Log out</a>
            </div>
        </section>
    
	<?php endif; ?>
	
	<?php if( $page_type === "admin" ) : ?>
        <section class="admin-wrapper">
    <?php elseif( $page_type === "user" ) : ?>
        <section class="user-wrapper">
	<?php endif; ?>
	
        <!-- Load necessary page -->
		<?php include_once($page); ?>

	<?php if( $page_type !== "general" ) : ?>
        </section>
	<?php endif; ?>
	
	<?php if( $page_type === "general" ) : ?>
	
        <footer class="general text-center">
            <a href="<?=base_url()?>">Home</a>
            <span>&#8226;</span> 
            <a href="<?=base_url('about')?>">About</a>
            <span>&#8226;</span> 
            <a href="<?=base_url('signup')?>">Sign Up</a>
        </footer>
	
    <?php elseif( $page_type === "user" ) : ?>
            
        <section class="footer">
            
        </section>
            
	<?php endif; ?>
	
	<script src="<?=base_url('assets/js/lib/angular/angular.min.js')?>"></script>
	<script src="<?=base_url('assets/js/lib/angular/angular-cookies.min.js')?>"></script>
	<script src="<?=base_url('assets/js/lib/angular/angular-foundation.min.js')?>"></script>
    
    <?php if($show_sm_js === true) : ?>
    
        <!-- Load Javascript framework -->	
        <script src="<?=base_url('assets/js/lib/jquery/jquery.min.js')?>"></script>

        <!-- Load Sharemind controller library and dependencies -->
        <script src="<?=base_url('assets/js/lib/sm/ext/typedarray.js')?>"></script>	
        <script src="<?=base_url('assets/js/lib/sm/ext/jsaes.js')?>"></script>	
        <script src="<?=base_url('assets/js/lib/sm/ext/jsbn.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/ext/jsbn2.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/ext/socket.io.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/prng.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/sm.types.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/sm.types.util.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/sm.types.base.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/sm.types.shared3p.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/serialization.js')?>"></script>
        <script src="<?=base_url('assets/js/lib/sm/sm.ctrl.js')?>"></script>
        <script>
			
			(function(hosts) {
				'use strict';

				hosts.addresses = <?=$host_addresses?>;

			})(this.hosts = this.hosts === undefined ? {} : this.hosts);
			
		</script>

        <!-- Load sharemind application Javascript -->
        <?php if( $page_type == "admin" ) : ?>
            <script src="<?=base_url('assets/js/admin.sm.app.js')?>"></script>
        <?php else: ?>
            <script src="<?=base_url('assets/js/user.sm.app.js')?>"></script>
        <?php endif; ?>
    
    <?php endif; ?>
            
    <?php if($show_pdf_js === true ) : ?>
        
        <!-- Load Javascript framework -->	
        <script src="<?=base_url('assets/js/lib/jquery/jquery.min.js')?>"></script>
        
        <script src="<?=base_url('assets/js/lib/pdfmake/pdfmake.min.js')?>"></script>	
        <script src="<?=base_url('assets/js/lib/pdfmake/vfs_fonts.js')?>"></script>
            
    <?php endif; ?>
    
	<!-- Load static application Javascript -->
	<script src="<?=base_url('assets/js/app.js')?>"></script>

	<?php if( $page_type === "admin" ) : ?>
	   <script src="<?=base_url('assets/js/admin.app.js')?>"></script>
	<?php elseif( $page_type === "user" ) : ?>
	   <script src="<?=base_url('assets/js/user.app.js')?>"></script>
	<?php endif; ?>
	
    <div class="loader"></div>
    
</body>
</html>