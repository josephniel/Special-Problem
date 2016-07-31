<section ng-controller="userPatientGenerateCtrl">

    <div class="contents">
        <div class="row clearfix">
        
            <div class="row columns">
                
                <form class="small-2 columns"
                     action="<?=base_url( 'user/select' )?>">
                    <button class="button expanded margin-top"
                            type="submit"
                            ng-disabled="generate_data">
                        Back to Step 1
                    </button>
                </form>
                
                <center class="small-8 columns">
				    <h5>Step 4: Generate Report</h5>
                </center>
                    
                <form class="small-2 columns"
                      action="<?=base_url( 'user' )?>">
                    <button class="button outline expanded margin-top"
                            type="submit"
                            ng-disabled="!isFinished">
                        Home
                    </button>
                </form>
                
			</div>
			
            <form class="row columns"
                  ng-submit="generateReport()"
                  id="generate-form"
                  ng-show="generate_data">
                
                <hr class="no-margin">

                <h5 class="small-12 columns">
                    Genomic Risk Information
                </h5>

                <div class="small-12 columns">
                    <ul class="custom">
                        <li class="clearfix">
                            <b class="float-left" style="width:200px;">Disease name:</b>
                            <span class="float-left" ng-bind="generate_data.disease_name"></span>
                        </li>
                        <li class="clearfix">
                            <b class="float-left" style="width:200px;">Risk coefficient:</b>
                            <span class="float-left" ng-bind="generate_data.coefficient"></span>
                        </li>
                        <li class="clearfix">
                            <b class="float-left" style="width:200px;">Results  retrieved on:</b>
                            <span class="float-left" ng-bind="generate_data.time_calculated"></span>
                        </li>
                    </ul>
                </div>

                <h5 class="small-12 columns no-margin-top">
                    Patient Information
                </h5>

                <div class="small-12 columns">
                    <div class="input-group">
                        <span class="input-group-label">
                            Patient Name
                        </span>
                        <input type="text"
                               class="input-group-field"
                               placeholder="Enter patient name"
                               ng-model="patient.name"
                               required>
                    </div>
                </div>

                <div class="small-4 columns float-left">
                    <div class="input-group">
                        <span class="input-group-label">
                            Patient Age
                        </span>
                        <input type="number"
                               min="1"
                               max="100"
                               class="input-group-field"
                               placeholder="Enter patient age"
                               ng-model="patient.age"
                               required>
                    </div>    
                </div>

                <div class="small-8 columns float-right">
                    <textarea id="textarea" 
                              rows="3"
                              ng-model="patient.remarks"
                              placeholder="Enter remarks"
                              required></textarea>
                </div>

                <div class="small-4 columns float-left">
                    <div class="input-group">
                        <span class="input-group-label">Patient Sex</span>
                        <label class="input-group-label">
                            Male&nbsp;
                            <input type="radio"
                                   name="sex"
                                   value="Male"
                                   class="input-group-field no-margin-left no-margin-right"
                                   ng-model="patient.sex"
                                   ng-required="true">
                        </label>
                        <label class="input-group-label">
                            Female&nbsp;
                            <input type="radio"
                                   name="sex"
                                   value="Female"
                                   class="input-group-field no-margin-left no-margin-right"
                                   ng-model="patient.sex"
                                   ng-required="true">
                        </label>
                    </div>
                </div>

                <hr>

                <div class="small-3 columns">
                    <button type="submit"
                            class="button outline expanded">
                        Generate Report
                    </button>
                </div>
            
            </form>
            
            <iframe id="pdf-iframe"></iframe>
                
            <hr class="no-margin" ng-hide="generate_data">
            
            <div class="small-12 columns"
                 ng-hide="generate_data">
                <h5>There is no active computation. Please start computation first.</h5>
            </div>
            
        </div>
    </div>
    
</section>