<section ng-controller="adminDiseaseCtrl">

    <div class="error-box-container">
		<alert class="error-box" 
			   ng-repeat="alert in alerts"
			   type="alert.type" 
			   close="closeAlert($index)"
		>
		{{alert.msg}}
		</alert>
	</div>
	
    <script type="text/ng-template" id="adminEditMarkerModal.html">
			
		<div class="modal-header">
			<span class="close-button clickable" ng-click="discardChanges()">&#215;</span>
			<h4 class="no-select default-cursor"><i class="fi-pencil"></i> &nbsp; Edit Marker</h4>
		</div>
		
		<div class="modal-body row">
			
			<div class="small-6 columns">
				<div class="input-group">
					<span class="input-group-label">Chromosome</span>
					<input class="input-group-field" 
						   type="number"
						   ng-model="marker.chromosome">
				</div>
			</div>
			
			<div class="small-6 columns">
				<div class="input-group">
					<span class="input-group-label">Position</span>
					<input class="input-group-field" 
						   type="number"
						   ng-model="marker.position">
				</div>
			</div>
			
			<div class="small-6 columns">
				<div class="input-group no-margin-bottom">
					<span class="input-group-label">Risk SNP</span>
					<input class="input-group-field" 
						   type="text"
						   ng-model="marker.risk_snp">
				</div>
			</div>
			
			<div class="small-6 columns">
				<div class="input-group no-margin-bottom">
					<span class="input-group-label">Odds Ratio</span>
					<input class="input-group-field" 
						   type="text"
						   ng-model="marker.odds_ratio">
				</div>
			</div>
			
		</div>
		
		<div class="modal-footer clearfix">
			<button class="button alert outline float-left" ng-click="deleteMarker()">
				Delete Marker
			</button>
			<button class="button float-right" ng-click="saveChanges()">
				Save Changes
			</button>
		</div>
			
	</script>
	
	<script type="text/ng-template" id="adminAddMarkerModal.html">
			
		<div class="modal-header">
			<span class="close-button clickable" ng-click="discardChanges()">&#215;</span>
			<h4 class="no-select default-cursor"><i class="fi-plus"></i> &nbsp; Add Marker for <span ng-bind="currentDiseaseName"></span></h4>
		</div>
		
		<form ng-submit="addMarker()">
		
			<div class="modal-body row">

				<div class="small-6 columns">
					<div class="input-group">
						<span class="input-group-label">Chromosome</span>
						<input class="input-group-field" 
							   type="number"
                               min="1"
                               max="22"
                               placeholder="1-22"
							   ng-model="marker.chromosome"
							   ng-required="true">
					</div>
				</div>

				<div class="small-6 columns">
					<div class="input-group">
						<span class="input-group-label">Position</span>
						<input class="input-group-field" 
							   type="number"
                               min="1"
                               max="999999999"
                               placeholder="e.g. 123456789"
							   ng-model="marker.position"
							   ng-required="true">
					</div>
				</div>

				<div class="small-6 columns">
					<div class="input-group no-margin-bottom">
						<span class="input-group-label">Risk SNP</span>
						<input class="input-group-field" 
							   type="text"
                               placeholder="A,C,T or G"
							   ng-model="marker.risk_snp"
							   ng-required="true">
					</div>
				</div>

				<div class="small-6 columns">
					<div class="input-group no-margin-bottom">
						<span class="input-group-label">Odds Ratio</span>
						<input class="input-group-field" 
							   type="text"
                               placeholder="e.g. 1.44"
							   ng-model="marker.odds_ratio"
							   ng-required="true">
					</div>
				</div>

			</div>

			<div class="modal-footer clearfix">
                
                <label for="uploadFile" 
                       class="button secondary float-left"
                       id="upload-button">
                    Batch Upload
                </label>
                
                <input type="file" 
                       id="uploadFile" 
                       class="show-for-sr" 
                       onchange="angular.element(this).scope().batchUpload( event )">
                
				<button class="button float-right" type="submit">
					Add Marker
				</button>
	
            </div>
			
		</form>
			
	</script>
    
	<div id="diseases" class="contents">
	
		<div class="row">
             
            <div class="row column">

                <div class="small-12 columns" >
                    
                    <form class="input-group margin-top">
                        
                        <span class="input-group-label">Add Disease: </span>

                        <input type="text" 
                               class="input-group-field"
                               placeholder="Enter disease name"
                               ng-model="disease_name"
                               ng-required="true">

                        <span class="input-group-button">
                            <button type="submit" 
                                    class="button"
                                    style="width: 100px"
                                    ng-click="addDiseaseName()">
                                <i class="fi-plus small-margin-right"></i>Add
                            </button>
                        </span>
                        
                        <span class="input-group-label  no-label-style">
                            <span class="secondary label large float-right" ng-bind="noOfDisease"></span>
                        </span>
                        
                    </form>
                    
                </div>
                
                <hr class="no-margin">

                <div class="small-12 columns"
                     ng-repeat="disease in diseases">

                    <div class="row disease-row"
						 ng-class="{'dark' : $index%2 == 0}">
						
						<div class="small-2 columns">
								<a class="button no-padding-top no-padding-bottom secondary outline expanded"
								   ng-click="!disease.disabled || showMarker($index)"
								   ng-disabled="!disease.disabled">
									<i class="fi-list size-16 small-margin-right"></i>Markers
								</a>
						</div>
                        
						<div class="small-7 columns">
                            <input type="text" 
                                   ng-model="disease.disease_name"
                                   ng-model-options="{ updateOn: 'blur' }"
                                   ng-disabled="disease.disabled"
                                   ng-required="true">
                        </div>

                        <div class="small-3 columns">
                            <div class="expanded button-group">
                                <a class="button no-padding-top no-padding-bottom"
                                   ng-click="editDiseaseName($index)">
                                    <i ng-class="disease.disabled ? 'fi-pencil' : 'fi-check'"
									   class="size-16 small-margin-right"></i>
									<span ng-bind="disease.disabled ? 'Edit' : 'Done'"></span>
                                </a>
                                <a class="button alert no-padding-top no-padding-bottom"
                                   ng-click="!disease.disabled || deleteDiseaseName($index)"
                                   ng-disabled="!disease.disabled">
                                    <i class="fi-x size-16 small-margin-right"></i>Delete
                                </a>
                            </div>
                        </div>
						
                    </div>
                </div>

                <div ng-show="diseaseCount == 0">
                    <h5 class="margin-left margin-right">There are no diseases to show. Add some.</h5>    
                </div>
				
            </div>    
            
		</div>
			
    </div>
    
	<div id="markers" class="contents" ng-show="diseaseCount != 0">
		<div class="row">
            
			<div class="small-3 columns margin-top margin-bottom">
				<button class="button outline no-margin"
						ng-click="showDiseases()">
						<i class="fi-arrow-left"></i>&nbsp;&nbsp;Back to disease page
				</button>
			</div>
			
			<div class="small-6 column margin-top margin-bottoms">
				<h5 class="text-center small-margin-top">
                    Markers for 
                    <span ng-bind="currentDiseaseName"></span>
                </h5>
			</div>
			
            <div class="small-3 columns clearfix margin-top margin-bottom">
                <span class="secondary label large float-right" ng-bind="noOfMarker"></span>
            </div>
                
            <hr class="no-margin">
            
			<div class="small-4 columns clearfix" ng-show="markerCount != 0">
				<div class="input-group margin-top">
					<span class="input-group-label">Search for: </span>
					<select class="input-group-field"
							ng-model="markerSearchOption"
							ng-options="markerSearch.predicate for markerSearch in markerSearches track by markerSearch.id">
					</select>
				</div>
			</div>
            
            <div class="small-8 columns clearfix" ng-show="markerCount != 0">
                <div class="input-group margin-top">
                    <input type="text" 
                           class="input-group-field"
                           placeholder="Search for {{markerSearchOption.predicate}}"
                           ng-model="markerSearchTerm"
                           ng-change="searchForMarker()">
                    <span class="input-group-label">
                        <span ng-bind="tempNoOfMarker"></span>
                    </span>
                </div>
            </div>
            
			<table class="text-center small-12 columns hover"
				   ng-show="markerCount != 0">
				<thead>
					<tr>
						<th width="25%" 
							class="text-center clickable"
							ng-click="order('chromosome')">
							<span class="no-select">
								Chromosome
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'chromosome'"></i>
						</th>
						<th width="25%"
							class="text-center clickable"
							ng-click="order('position')">
							<span class="no-select">
								Position
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'position'"></i>
						</th>
						<th width="25%"
							class="text-center clickable"
							ng-click="order('risk_snp')">
							<span class="no-select">
								Risk SNP
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'risk_snp'"></i>
						</th>
						<th width="25%" 
							class="text-center clickable"
							ng-click="order('odds_ratio')">
							<span class="no-select">
								Odds Ratio
							</span>
							<i ng-class="!reverse ? 'fi-arrow-up' : 'fi-arrow-down' "
							   ng-show="predicate === 'odds_ratio'"></i>
						</th>
					</tr>
				</thead>
				<tbody ng-show="tempMarkerCount != 0">
					<tr class="clickable no-select"
						ng-repeat="marker in tempCurrentMarkers"
						ng-click="openModal( marker, markers.indexOf(marker) )"
                        ng-show="paginationShowPage( $index )">
						<td ng-bind="marker.chromosome"></td>
						<td ng-bind="marker.position"></td>
						<td ng-bind="marker.risk_snp"></td>
						<td ng-bind="marker.odds_ratio | number:2"></td>
					</tr>
				</tbody>
                <tbody ng-hide="tempMarkerCount != 0">
                    <tr class="no-select">
                        <td colspan="4">There are no markers with "<span ng-bind="markerSearchTerm"></span>" in its <span ng-bind="markerSearchOption.predicate"></span> .</td>
                    </tr>
                </tbody>
			</table>
			
            <div class="row column"
                 ng-show="markerCount != 0">
                
                <div class="small-3 columns">
                    <button class="secondary button outline no-margin expanded"
                            ng-click="updateToSharemind()">
                        Update Sharemind database
                    </button>
                </div>
                
                <center class="small-6 columns">
                    <pagination total-items="markerCount" 
                                page="paginationCurrentPage" 
                                items-per-page="paginationItemSize"
                                max-size="paginationMaxSize" 
                                class="pagination-sm small-margin-top no-margin-bottom" 
                                boundary-links="true" 
                                rotate="false" >
                    </pagination>
                </center>
                
                <div class="small-3 columns">
                    <button class="button expanded no-margin-bottom"
                            ng-click="openAddMarkerModal()">
                        Add New Marker/s
                    </button>
                </div>
                
            </div>
            
            <div class="small-12 columns margin-top clearfix">
			
                <h6 class="float-left small-margin-top"
				    ng-show="markerCount == 0">
					   There are currently no markers to show for <span ng-bind="currentDiseaseName"></span>. 
                </h6>
            
                <button class="button float-right"
                        ng-click="openAddMarkerModal()"
                        ng-show="markerCount == 0">
                    Add New Marker/s
                </button>
            
            </div>
			
		</div>
	</div>
	
</section>