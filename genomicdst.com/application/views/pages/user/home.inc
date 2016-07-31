<section ng-controller="userCtrl">

    <div class="contents-transparent">
        <div class="row">
            
            <h5 class="small-12 columns">
                Welcome, <strong ng-bind="user_name"></strong>!
                <hr>
            </h5>
            
            <div class="small-4 columns">
                
                <div class="contents container-outline">
                    
                    <h4 class="no-margin">Calculator</h4>
                    
                    <hr class="small-margin-top">
                    
                    <a href="<?=base_url( 'user/select' ) ?>">
                        <button class="button expanded no-margin">
                            Proceed to Calculator
                        </button>
                    </a>

                </div>
                
                <div class="contents container-outline">
                    
                    <h4 class="no-margin lighter">
                        <span class="smaller">Info</span>
                    </h4>
                    
                    <hr class="small-margin-top">

                    <ul class="small-margin-bottom">
                        
                        <li class="small-margin-bottom">
                            To start the computation, go to the
                            <strong>
                                <a href="<?=base_url( 'user/select' )?>">start computation</a>
                            </strong>
                            page and upload a patient's variant list in VCF format.
                        </li>   

                        <li class="small-margin-bottom">
                            <strong>
                                <a href="<?=base_url( 'user/calculate' )?>">Retrieving result</a>
                            </strong> is only available whenever a patient variant has 
                            been uploaded to the Sharemind servers; and 
                            <strong>
                                <a href="<?=base_url( 'user/results' )?>">generating report</a>
                            </strong> 
                            is only available one computation has been finished.
                        </li>
                        
                        <li>
                            The uploaded patient variant is <strong>immediately deleted</strong> from 
                            the Sharemind miners the first time results are successfully retrieved.
                        </li>
                        
                    </ul>
                        
                </div>
                
            </div>
            
            <div class="small-8 columns">
                
                <div class="contents container-outline">
                    
                    <h4 class="no-margin lighter">
                        <span class="smaller">Recent Activities</span>
                    </h4>
                    
                    <hr class="small-margin-top">
                    
                    <h6 class="small-margin-bottom text-center"
                        ng-show="hasActivityLog()">
                        <strong ng-bind="label()"></strong>
                    </h6>
                    
                    <table ng-show="hasActivityLog()">
                        <tbody class="log-container">
                            <tr class="log" ng-repeat="log in logs">
                                <td width="30%"
                                    ng-bind="log.timestamp">
                                </td>
                                <td width="70%" 
                                    ng-bind="log.message">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="clearfix">
                        
                        <button class="button outline no-margin-bottom float-left"
                                ng-click="showMore( false )" 
                                ng-show="hasActivityLog()"
                                ng-disabled="isNextDisabled()">
                            Next
                        </button>
                        
                        <button class="button outline no-margin-bottom float-right"
                                ng-click="showMore( true )" 
                                ng-show="hasActivityLog()"
                                ng-disabled="isPreviousDisabled()">
                            Previous
                        </button>
                        
                    </div>
                    
                    <p ng-hide="hasActivityLog()">
                        No activity has been performed by this user.
                    </p>
                        
                </div>
                
            </div>
            
        </div>
    </div>
    
</section>