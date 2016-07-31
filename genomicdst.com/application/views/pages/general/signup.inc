<script type="text/javascript">
	window.data = <?= ($signup_error != "" ) ? $signup_error : "{}" ?>;
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

	<section class="signup row">
		<form class="large-8 large-centered 
					 columns callout large"
			  method="POST" action="<?=base_url('finish_signup')?>">

			<h4>Sign Up Form</h4>

			<hr>

			<label>
				<h6>Institution Name</h6>
				<input name="name"
					   type="text" 
					   placeholder="Enter institution's name" 
					   ng-model="credentials.name"
					   required>
			</label>

			<label>
				<h6>Institution Email Address</h6>
				<input name="email"
					   type="text" 
					   placeholder="email_address@institution.org" 
					   ng-model="credentials.email"
					   required>
			</label>

			<div class="row">
				<label class="large-6 columns">
					<h6>Password</h6>
					<input name="password"
						   type="password" 
						   placeholder="Enter password" 
						   ng-model="credentials.password"
						   required>
				</label>
				<label class="large-6 columns">
					<h6>Retype Password</h6>
					<input name="password_retype"
						   type="password" 
						   placeholder="Retype password" 
						   ng-model="credentials.password_retype"
						   required>
				</label>
			</div>

			<hr>

			<button type="submit" class="button expanded">Sign up</button>

		</form>
	</section>

</div>