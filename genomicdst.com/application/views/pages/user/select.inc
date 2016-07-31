<section ng-controller="userDiseaseSelectionCtrl">

	<div class="contents">
		
		<form class="row"
			  method="post"
			  action="<?=base_url('user/process_select_disease')?>">
		
			<div class="row columns">
                
                <div class="small-2 columns">
                    <button class="button expanded margin-top" disabled>
                        Back
                    </button>
                </div>
                
                <center class="small-8 columns">
				    <h5>Step 1: Select Disease</h5>
                </center>
                    
                <div class="small-2 columns">
                    <button class="button expanded margin-top"
                            type="submit"
                            ng-disabled="diseaseName == ''">
                        Next
                    </button>
                </div>
                
			</div>
			
			<div class="small-12 columns diseases-list no-padding"
				 ng-repeat="disease in diseases"
                 ng-class="{'even' : $index%2 == 0, 'selected' : isDiseaseSelected( $index )}"
				 ng-show="diseases.length != 0">
			
                    <div class="custom-radiobox-container">
						<label for="{{$index}}"
							   class="custom-radiobox clickable"
							   ng-class="{'checked' : isDiseaseSelected( $index )}">
						</label>
					</div>

					<label for="{{$index}}"
						   class="custom-radiobox-label clickable no-select"
                           ng-class="{'last' : $index + 1 == numOfDiseases}">
						<span ng-bind="disease.disease_name"></span>
					</label>
                
					<input type="radio" 
                           name="selected_disease"
                           id="{{$index}}"
						   value="{{disease.disease_name}}"
                           ng-model="diseaseName"
                           ng-click="radioToggled( $index )"
                           ng-show="false"
                           required>
			
            </div>
			
			<hr class="no-margin"
				ng-show="diseases.length == 0">
			
			<h5 class="small-12 columns"
				ng-show="diseases.length == 0">
				The disease catalog is currently empty.
			</h5>
			
		</form>
		
	</div>
	
</section>