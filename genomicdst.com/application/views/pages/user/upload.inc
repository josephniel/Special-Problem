<section ng-controller="userPatientUploadCtrl">

    <div class="error-box-container">
		<alert class="error-box" 
			   ng-repeat="alert in alerts"
			   type="alert.type" 
			   close="closeAlert($index)"
		>
		{{alert.msg}}
		</alert>
	</div>
    
    <div class="contents">
        <div class="row">

            <div class="row columns">
                
                <form class="small-2 columns"
                      action="<?=base_url( 'user/select' )?>">
                    <button class="button expanded margin-top"
                            type="submit">
                        Back
                    </button>
                </form>
                    
                <center class="small-8 columns">
				    <h5>Step 2: Upload Patient Variant in VCF</h5>
                </center>
                    
                <form class="small-2 columns" action="<?=base_url( 'user/calculate' )?>">
                    <button class="button expanded margin-top"
                            ng-disabled="!isUploaded"
                            type="submit">
                        Next
                    </button>
                </form>
                   
            </div>
            
            <div class="small-12 columns no-padding">
                <textarea ng-readonly="true"
                          rows="10"
                          class="default-cursor no-select console  no-margin"></textarea>
            </div>
            
            <div class="small-12 columns clearfix" id="slide-up-button">
                <label for="uploadFile" 
                       class="secondary button outline float-right margin-top"
                       id="upload-button">
                    Upload Patient VCF to Sharemind
                </label>
                <input type="file" 
                       id="uploadFile" 
                       class="show-for-sr" 
                       onchange="angular.element(this).scope().processVCF( event )">
            </div>
            
        </div>
    </div>
    
</section>