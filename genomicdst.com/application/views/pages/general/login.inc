<script type="text/javascript">
	window.data = <?= ($login_error != "" ) ? $login_error : "{}" ?>;
</script>

<div ng-controller="alertCtrl" ng-init="initializeAlert('data')">
	
	<div class="error-box-container">
		<alert class="error-box" 
			   ng-repeat="alert in alerts"
			   type="alert.type" 
			   close="closeAlert($index)"
		>
		{{alert.msg}}
		</alert>
	</div>
	
	<section class="login row">
		<form class="large-4 large-centered 
					 medium-6 medium-centered
					 columns callout large"
			  method="POST" action="./validate_login">

			<label>
				<h6>Username</h6>
				<input name="user_email" 
					   type="text" 
					   placeholder="sample@unit.org" 
					   ng-model="credentials.username"
					   required>
			</label>

			<label>
				<h6>Password</h6>
				<input name="user_password"
					   type="password" 
					   placeholder="Password" 
					   ng-model="credentials.password"
					   required>
			</label>

			<hr>

			<button type="submit" 
					class="button expanded" 
					>
				Log In
			</button>

			<div class="text-center">
				<a href="<?=base_url('signup')?>">New here? Sign up!</a>
			</div>	

		</form>
	</section>
	
</div>