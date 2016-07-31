<section ng-controller="userPatientRetrieveCtrl">
    
    <div class="contents">
        
        <div class="row">

            <div class="row columns clearfix">
                
                <form class="small-2 columns"
                     action="<?=base_url( 'user/upload' )?>">
                    <button class="button expanded margin-top"
                            type="submit"
                            ng-disabled="!isReady()">
                        Back
                    </button>
                </form>
                
                <center class="small-8 columns">
				    <h5>Step 3: Calculate Risk Coefficient</h5>
                </center>
                    
                <form class="small-2 columns"
                      ng-show="isReady()"
                      action="<?=base_url( 'user/results' )?>">
                    <button class="button expanded margin-top"
                            type="submit"
                            ng-disabled="!isFinished">
                        Next
                    </button>
                </form>
                
                <form class="small-2 columns"
                      action="<?=base_url( 'user/select' )?>"
                      ng-hide="isReady()">
                    <button class="button expanded margin-top"
                            type="submit">
                        Select Disease
                    </button>
                </form>
                
            </div>
            
            <hr class="no-margin">
            
            <h4 class="small-12 columns coefficient-result no-margin"
                ng-show="isReady()">
                <strong>Risk Coefficient: </strong>
                <span ng-bind="coefficient"></span>
            </h4>
            
            <div class="small-12 columns margin-top"
                 ng-show="isReady()">
                <ul class="custom">
                    <li><b>Disease Name:</b> <span ng-bind="disease_name"></span></li>
                    <li><b>Latest Upload:</b> <span ng-bind="upload_time"></span></li>
                </ul>
            </div>
            
            <div class="small-12 columns clearfix"
                 ng-hide="isReady()">
                <h5 class="float-left">
                    <b>Notice:</b> No computation is started. Please select a disease first first!
                </h5>
                
            </div>
            
            <div class="small-12 columns no-padding">
                <textarea ng-readonly="true"
                          rows="10"
                          class="default-cursor no-select console no-margin"></textarea>
            </div>
            
            <div class="small-12 columns clearfix" 
                 id="slide-up-button"
                 ng-show="isReady()"
                 >
                <button class="secondary button outline margin-top float-right"
                        ng-click="retrieveResult()">
                    Retrieve Result
                </button>
            </div>
            
        </div>
        
    </div>
    
</section>