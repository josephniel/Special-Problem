<section ng-controller="adminCtrl">

    <div class="contents-transparent">
        <div class="row">
            
            <h5 class="small-12 columns">
                Welcome, <strong ng-bind="user_name"></strong>!
                <hr>
            </h5>
            
            <div class="small-4 columns">
                
                <div class="contents container-outline">
                    
                    <h4 class="no-margin lighter">
                        <span class="smaller">Info</span>
                    </h4>
                    
                    <hr class="small-margin-top">

                    <ul class="small-margin-bottom">
                        
                        <li class="small-margin-bottom">
                            For user computation, a 
                            <strong>
                                <a href="<?=base_url( 'admin/diseases' )?>">disease</a> 
                            </strong>
                            should be added if not available in the system.
                        </li>   

                        <li class="small-margin-bottom">
                            Whenever a 
                            <strong>
                                <a href="<?=base_url( 'admin/diseases' )?>">disease marker</a> 
                            </strong>
                            is updated (e.g. add, edit, or delete), the update should also be reflected
                            in the Sharemind servers by clicking the <strong>Update Sharemind database</strong>
                            button.
                        </li>
                        
                        <li>
                            <strong>
                                <a href="<?=base_url( 'admin/users' )?>">Users</a> 
                            </strong>
                            can only be approved or disapproved, edited, and deleted from the system. 
                            User creation is done in the sign-up page. 
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