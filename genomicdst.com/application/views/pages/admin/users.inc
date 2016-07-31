<section ng-controller="adminUsersCtrl">

	<div class="error-box-container">
		<alert class="error-box" 
			   ng-repeat="alert in alerts"
			   type="alert.type" 
			   close="closeAlert($index)"
		>
		{{alert.msg}}
		</alert>
	</div>
	
	<script type="text/ng-template" id="adminUserModal.html">
			
		<div class="modal-header">
			<span class="close-button clickable" ng-click="discardChanges()">&#215;</span>
			<h4 class="no-select default-cursor"><i class="fi-pencil"></i> &nbsp; Edit User</h4>
		</div>
		
		<div class="modal-body row">
			
			<div class="small-7 columns">
				<div class="input-group">
					<span class="input-group-label">Medical Unit ID</span>
					<input class="input-group-field default-cursor text-center" 
						   type="text"
						   ng-value="user.unit_id"
						   ng-disabled="true">
				</div>
			</div>
			
			<div class="small-5 columns custom-checkbox-column">
				<div class="custom-checkbox-wrapper">
					
					<div class="custom-checkbox-container">
						<label for="approve_checkbox"
							   class="custom-checkbox clickable"
							   ng-class="{'checked' : isApprovedToggled()}">
						</label>
					</div>

					<label for="approve_checkbox"
						   class="custom-checkbox-label clickable no-select">
						Approved
					</label>

					<input type="checkbox"
						   id="approve_checkbox"
						   ng-model="user.status.value"
						   ng-show="FALSE">
				</div>
			</div>
			
			<div class="small-12 columns">
				<div class="input-group">
					<span class="input-group-label">Medical Unit Name</span>
					<input class="input-group-field" 
						   type="text"
						   ng-model="user.unit_name">
				</div>
			</div>
			
			<div class="small-12 columns">
				<div class="input-group">
					<span class="input-group-label">Medical Unit Email</span>
					<input class="input-group-field" 
						   type="text"
						   ng-model="user.email">
				</div>
			</div>
			
		</div>
		
		<div class="modal-footer clearfix">
			<button class="button alert outline float-left" ng-click="deleteUser()">
				Delete User
			</button>
			<button class="button float-right" ng-click="saveChanges()">
				Save Changes
			</button>
		</div>
			
	</script>
	
	<div class="contents">
		
		<div class="row">
			
			<h5 class="small-12 columns">
				System Users
				<span class="secondary label large float-right" ng-bind="noOfUser"></span>
			</h5>
			
			<table class='small-12 columns no-margin hover large-padding'>
				<thead>
					<tr class="clickable">
						<th width="15%" 
							class="text-center clickable"
							ng-click="order('unit_id')">
							<span class="no-select">
								Unit ID
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'unit_id'"></i>
						</th>
						<th width="30%"
							class="text-center clickable"
							ng-click="order('unit_name')">
							<span class="no-select">
								Unit Name
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'unit_name'"></i>
						</th>
						<th width="30%"
							class="text-center clickable"
							ng-click="order('email')">
							<span class="no-select">
								Email Address
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'email'"></i>
						</th>
						<th width="25%" 
							class="text-center clickable"
							ng-click="order('status.label')">
							<span class="no-select">
								Unit Status
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'status.label'"></i>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr ng-repeat="user in users"
						ng-click="openModal( user, $index )"
						class="clickable">
						<td ng-bind="user.unit_id" class="text-center"></td>
						<td ng-bind="user.unit_name"></td>
						<td ng-bind="user.email"></td>
						<td ng-bind="user.status.label" class="text-center"></td>
					</tr>
				</tbody>
			</table>
			
			<h5 class="small-12 columns"
				 ng-show="userNumber == 0">
				There are currently no users registered in the system. 
			</h5>
		
		</div>
			
	</div>
		
</section>