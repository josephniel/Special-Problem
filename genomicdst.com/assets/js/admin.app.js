(function() {
    "use strict";
    
	angular
		.module( "tuazon.genomicdst.admin", 
				["mm.foundation", "tuazon.genomicdst"] )
	
		.controller( "adminCtrl",
			["$http", "$scope", 
			function( $http, $scope ) { 
		
                $http.get( './admin/get/home' )
                    .success( function( data ) {
						$scope.user_name = data.user_name;
						$scope.logs = data.log;
                        $scope.max_log = data.max_log;
                    });
                
                $scope.start = 0;
                $scope.end = 10;
                $scope.logs = [];
                $scope.hasActivityLog = function() {
                    return ( $scope.logs.length > 0 );
                }
                
                $scope.isPreviousDisabled = function() {
                    return !( ($scope.start + 10) < $scope.max_log );
                }
                
                $scope.isNextDisabled = function() {
                    return ($scope.start == 0);
                }
                
                $scope.label = function() {
                    
                    var endLabel = ( $scope.isPreviousDisabled() ) ? $scope.max_log : $scope.end;
                    
                    return "Activities " + ( $scope.start + 1 ) + " - " + endLabel;
                }
                
                $scope.showMore = function( previous ) {
                    
                    var tempStart;
                    var tempEnd;
                    var proceed = false;
                    if( !$scope.isPreviousDisabled() && previous ) {
                    
                        tempStart = $scope.start + 10;
                        tempEnd = $scope.end + 10;
                        proceed = true;
                    }
                    else if( !$scope.isNextDisabled() && !previous ) {
                        
                        tempStart = $scope.start - 10;
                        tempEnd = $scope.end - 10;
                        proceed = true;
                    }
                    
                    if( proceed ) {
                        
                        $http.post( './admin/post/update_log', { start: tempStart, end: tempEnd } )
                            .success( function( data ) {

                                $scope.logs = data.log;

                                $scope.start = tempStart;
                                $scope.end = tempEnd;
                             });
                    }
                }
				
		}])

		.controller( "adminDiseaseCtrl",
			[ "$http", "$scope", "$timeout", "$filter", "alertFactory", "$modal", "$log",
			function( $http, $scope, $timeout, $filter, alertFactory, $modal, $log  ) { 
		
				$scope.alerts = alertFactory.alerts;
				$scope.closeAlert = alertFactory.closeAlert;
				
                $scope.diseaseCount = 0;
				$http.get( './get/diseases' )
                    .success( function( data ) {
                    
                        $scope.diseases = data.diseases;
                    
                        $scope.currentDisease = $scope.diseases[0];
                        $scope.diseaseCount = $scope.diseases.length; 
                        $scope.noOfDisease = 
                            ($scope.diseases.length + " disease" + (( $scope.diseases.length > 1 ) ? "s" : "") );
                    
                        $scope.markers = data.markers;
                    
						$scope.updateMarkers( 1 ); 
                        $scope.order( "chromosome" );
				    });
				
                $scope.markerSearches = [
                    { id: 0, predicate: "Chromosome", key: "chromosome" },
                    { id: 1, predicate: "Position", key: "position" },
                    { id: 2, predicate: "Risk SNP", key: "risk_snp" },
                    { id: 3, predicate: "Odds Ratio", key: "odds_ratio" }
                ];
                $scope.markerSearchOption = $scope.markerSearches[0];
                
                $scope.searchForMarker = function() {
                    
                    var searchFilter = {};
                    searchFilter[$scope.markerSearchOption.key] = $scope.markerSearchTerm;
                    
                    $scope.tempCurrentMarkers = $filter( "filter" )( $scope.currentMarkers, searchFilter );
                    $scope.tempMarkerCount = $scope.tempCurrentMarkers.length;
                    
                    $scope.tempNoOfMarker = 
                        ($scope.tempMarkerCount + " marker" + (( $scope.tempMarkerCount > 1 ) ? "s" : "") );
                    
                    if( $scope.markerSearchTerm == "" ) $scope.order( "chromosome" );
                }
                
				$scope.order = function( predicate ) {
					
                    $scope.predicate = predicate;
				    $scope.tempCurrentMarkers = $filter( "orderBy" )( $scope.tempCurrentMarkers, predicate, $scope.reverse );
				    $scope.reverse = ( $scope.predicate === predicate ) ? !$scope.reverse : false;
                }
				
                $scope.markerCount = 0;
				$scope.updateMarkers = function( index, sort ) {

                    if( $scope.diseases.length != 0 ) {
                        
                        $scope.currentDisease = $scope.diseases[index-1];

                        $scope.currentDiseaseName = $scope.currentDisease.disease_name;
                        $scope.markerCount = 0;

                        $scope.currentMarkers = [];
                        angular.forEach( $scope.markers, function( value ) {
                            if( value.disease_id == $scope.currentDisease.disease_id ) {
                                value.chromosome = parseInt( value.chromosome );
                                value.position = parseInt( value.position );
                                value.odds_ratio = parseFloat( value.odds_ratio );
                                this.push( value );
                                $scope.markerCount += 1;
                            }
                        }, $scope.currentMarkers );

                        $scope.searchForMarker();

                        if( sort ) $scope.order( "chromosome" );

                        $scope.markerCount = $scope.currentMarkers.length;
                        $scope.noOfMarker = 
                            ($scope.markerCount + " marker" + (( $scope.markerCount > 1 ) ? "s" : "") );
                    }
				}
                
				$scope.paginationItemSize = 10;
                $scope.paginationMaxSize = 5;
                $scope.paginationCurrentPage = 1;
                
                $scope.paginationMinIndex = function() {
                    return ( $scope.paginationItemSize * $scope.paginationCurrentPage ) - $scope.paginationItemSize;
                }
                    
                $scope.paginationMaxIndex = function() {
                    return ( $scope.paginationItemSize * $scope.paginationCurrentPage );
                }
                
                $scope.paginationShowPage = function( index ) {
                    return ( $scope.paginationMinIndex() <= index && $scope.paginationMaxIndex() > index );
                }
                
				$scope.showMarker = function( index ) {
					
					$scope.updateMarkers( index + 1 );
					
					$( "#diseases" ).slideUp( 750, function() {
						$( "#markers" ).slideDown( 750 );
					});
				}
				
				$scope.showDiseases = function() {
					
					$( "#markers" ).slideUp( 750, function() {
						$( "#diseases" ).slideDown( 750 );
					});
				}
				
				$scope.addDiseaseName = function() {
					
					$http.post( './post/add_disease', { disease_name: $scope.disease_name } )
						.success( function( data ) {
						
							$scope.disease_name = "";
						
							angular.copy( data.diseases, $scope.diseases );
						
							alertFactory.addAlert( data.alert.type, data.alert.msg );
							$timeout( function() {
								alertFactory.closeAlert();
							}, 5000);
                        
                            $scope.diseaseCount = $scope.diseases.length;
                            $scope.noOfDisease = 
                                ($scope.diseaseCount + " disease" + (( $scope.diseaseCount > 1 ) ? "s" : "") );
                            $scope.noOfMarker = 
                                ($scope.markerCount + " marker" + (( $scope.markerCount > 1 ) ? "s" : "") );
                        
                        });
				}
				
				$scope.editDiseaseName = function( index ) {
				
					if( !$scope.diseases[index].disabled ) {
						
						$http.post( './post/edit_disease', { disease: $scope.diseases[index] } )
							.success( function( data ) {
								
								angular.copy( data.diseases, $scope.diseases );
							
								alertFactory.addAlert( data.alert.type, data.alert.msg );
								$timeout( function() {
									alertFactory.closeAlert();
								}, 5000);
							});
					}
					$scope.diseases[index].disabled = ( $scope.diseases[index].disabled ) ? false : true;	
				}
				
				$scope.deleteDiseaseName = function( index ) {
					
					var temp_disease_name = $scope.diseases[index].disease_name;
					if (confirm('Are you sure you want to delete ' + temp_disease_name + ' from the database?')) {
						
						var callback = function( finalCallback ) {
                            
                            $http.post( './post/delete_disease', { disease_name: temp_disease_name } )
                                .success( function( data ) {

                                    angular.copy( data.markers, $scope.markers );
                                    $scope.diseases.splice( index, 1 );
                                
                                    if( $scope.diseases.length <= index && $scope.diseases.length != 0 ) {
                                        $scope.updateMarkers( index, false );
                                    }
                                    else if( $scope.diseases.length != 0 ) {
                                        $scope.updateMarkers( index + 1, false );
                                    }
                                
                                    alertFactory.addAlert( data.alert.type, data.alert.msg );
                                    $timeout( function() {
                                        alertFactory.closeAlert();
                                    }, 5000);

                                    $scope.diseaseCount = $scope.diseases.length;    
                                    $scope.noOfDisease = 
                                            ($scope.diseaseCount + " disease" + (( $scope.diseaseCount > 1 ) ? "s" : "") );
                            
                                
                                    if( finalCallback ) finalCallback();
                                });
                        }
                         
                        app.init( true );
                        app.deleteTable( $scope.diseases[index].disease_id, callback );
					} 
				}
                
                $scope.updateToSharemind = function() {
                    
                    var callback = function( finalCallback ) {
                        
                        alertFactory.addAlert( "success", "Sharemind database updated!" );
				        $timeout( function() {
				            alertFactory.closeAlert();
                        }, 5000);
                        
                        if( finalCallback ) finalCallback(); 
                    }
                    
                    app.init( true );
                    app.storeMarkers( $scope.currentMarkers, 0, callback );
                }
                
				$scope.openAddMarkerModal = function() {
					
					$modal
						.open({ 
							templateUrl: 'adminAddMarkerModal.html', 
							controller: 'adminAddMarkerModal', 
							size: 'small',
							resolve: {
								data: function(){
									return { 
										disease_id: { disease_id: $scope.currentDisease.disease_id },
										disease_name: $scope.currentDiseaseName 
									};
								}
							}
						})
						.result.then(
							function( data ) { // CLOSE CALLBACK / CLOSE PROMISE FULFILLED
								
								angular.copy( data.markers, $scope.markers );
								
								$scope.reverse = !$scope.reverse;
								
								alertFactory.addAlert( data.alert.type, data.alert.msg );
								$timeout( function() {
									alertFactory.closeAlert();
								}, 5000);
							}, 
							function( data ) { // DISMISS CALLBACK / CLOSE PROMISE REJECTED
								$log.info('Modal dismissed at: ' + new Date());
							}
						);
				}
				
				$scope.openModal = function( marker, index ) { 
					
					$modal
						.open({ 
							templateUrl: 'adminEditMarkerModal.html', 
							controller: 'adminEditMarkerModal', 
							size: 'small',
							resolve: { 	// This creates a local variable for the defined controller
								data: function() { return marker; }, 
								index: function() { return index; }
							}, 
						})
						.result.then(
							function( data ) { // CLOSE CALLBACK / CLOSE PROMISE FULFILLED
								
								if( angular.isDefined( data.edit ) ){
									
									angular.copy( data.edit.markers, $scope.markers );
								
									$scope.reverse = !$scope.reverse;
									
									alertFactory.addAlert( data.edit.alert.type, data.edit.alert.msg );
									$timeout( function() {
										alertFactory.closeAlert();
									}, 5000);
								}
								else if( angular.isDefined( data.delete ) ) {
									
									$scope.markers.splice( data.index, 1 );
									
									$scope.reverse = !$scope.reverse;
									
									alertFactory.addAlert( data.delete.alert.type, data.delete.alert.msg );
									$timeout( function() {
										alertFactory.closeAlert();
									}, 5000);
								}
							}, 
							function( data ) { // DISMISS CALLBACK / CLOSE PROMISE REJECTED
								$log.info('Modal dismissed at: ' + new Date());
							}
						);
				}	
				
		}])
	
		.controller( 'adminAddMarkerModal', 
			[ "$scope", "$modalInstance", "$http", "data",
			function( $scope, $modalInstance, $http, data ) { 
		
				$scope.marker = {};
				$scope.currentDiseaseName = data.disease_name;
				
                $scope.batchUpload = function( event ) {
                    
                    var input = event.target;
                    var reader = new FileReader();
                    
                    reader.onload = function() {
                        
                        var variable = { file: reader.result };
                        angular.extend( variable, data.disease_id );
                        
                        $( ".loader" ).fadeIn();
                        
                        $http.post( './post/add_batch_marker', variable )
                            .success( function( response ) {
                                $( ".loader" ).fadeOut();
                                $modalInstance.close( response );
                            });
                    }
                    reader.readAsText( input.files[0] );
                }
                
				$scope.addMarker = function() { 
					
					angular.extend( $scope.marker, data.disease_id );
						
					$http.post( './post/add_marker', $scope.marker )
						.success( function( response ) {
							$modalInstance.close( response ); // param - response data 
						});
				}; 
		
				$scope.discardChanges = function() { 
					
					$modalInstance.dismiss( null );  // param - response data
				}; 
		}])
	
		.controller( 'adminEditMarkerModal', 
			[ "$scope", "$modalInstance", "$http", "data", "index",
			function( $scope, $modalInstance, $http, data, index ) { 
		
				$scope.marker = {};
				angular.copy( data, $scope.marker );
				
				$scope.saveChanges = function() { 
					
					if( confirm( 'Proceed to editing marker?' ) ) {
					
						var finalPost = { marker: { old: data, new: $scope.marker } };
					
						$http.post( './post/edit_marker', finalPost )
							.success( function( response ) {
								$modalInstance.close( {edit: response} ); // param - response data 
							});
					}
				}; 
		
				$scope.discardChanges = function() { 
					
					$modalInstance.dismiss( null );  // param - response data
				}; 
				
				$scope.deleteMarker = function() {
					
					if( confirm( 'Proceed to deleting marker? This cannot be undone.' ) ) {
						
						$http.post( './post/delete_marker', { marker : data } )
							.success( function( response ) {
								$modalInstance.close( {delete: response, index: index} ); // param - response data 
							});
					}
				}
		}])
	
		.controller( "adminUsersCtrl",
			[ "$http", "$scope", "$timeout", "$filter", "alertFactory", "$modal", "$log",
			function( $http, $scope, $timeout, $filter, alertFactory, $modal, $log ) { 
			
				$scope.alerts = alertFactory.alerts;
				$scope.closeAlert = alertFactory.closeAlert;

				$http.get( './get/users' )
					.success( function( data ) {
						$scope.users = [];
						angular.forEach( data.users, function( value ) {
							value.unit_id = parseInt( value.unit_id );
							this.push( value );	
						}, $scope.users );
						$scope.userNumber = $scope.users.length;
						$scope.noOfUser = ($scope.userNumber + " user" + (( $scope.userNumber > 1 ) ? "s" : "") );
						$scope.order( 'unit_id' );
					});
				
				$scope.order = function( predicate ) {
					
					$scope.predicate = predicate;
					$scope.users = $filter( "orderBy" )( $scope.users, predicate, $scope.reverse );
					$scope.reverse = ( $scope.predicate === predicate ) ? !$scope.reverse : false;
				}
				
				$scope.openModal = function( user, index ) { 
					
					$modal
						.open({ 
							templateUrl: 'adminUserModal.html', 
							controller: 'AdminUsersModal', 
							size: 'small',
							resolve: { 	// This creates a local variable for the defined controller
								data: function() { return user; }, 
								index: function() { return index; }
							}, 
						})
						.result.then(
							function( data ) { // CLOSE CALLBACK / CLOSE PROMISE FULFILLED
								
								if( angular.isDefined( data.edit ) ){
									
                                    $scope.users = [];
                                    angular.forEach( data.edit.users, function( value ) {
                                        value.unit_id = parseInt( value.unit_id );
                                        this.unshift( value );	
                                    }, $scope.users );
								
									alertFactory.addAlert( data.edit.alert.type, data.edit.alert.msg );
									$timeout( function() {
										alertFactory.closeAlert();
									}, 5000);
								}
								else if( angular.isDefined( data.delete ) ) {
									
									$scope.users.splice( data.index, 1 );
									
									alertFactory.addAlert( data.delete.alert.type, data.delete.alert.msg );
									$timeout( function() {
										alertFactory.closeAlert();
									}, 5000);
								}
							}, 
							function( data ) { // DISMISS CALLBACK / CLOSE PROMISE REJECTED
								$log.info('Modal dismissed at: ' + new Date());
							}
						);
				}; 			
		}])

		.controller( 'AdminUsersModal', 
			[ "$scope", "$modalInstance", "$http", "data", "index",
			function( $scope, $modalInstance, $http, data, index ) { 
		
				$scope.user = {};
				angular.copy( data, $scope.user );
				
				$scope.isApprovedToggled = function() {
					return ( $scope.user.status.value == 0 ) ? false : true;
				};
				
				$scope.saveChanges = function() { 
					
					if (confirm('Proceed to editing user: \"' + data.unit_name + '\"?')) {
					
						var finalPost = { user: { old: data, new: $scope.user } };
					
						$http.post( './post/edit_user', finalPost )
							.success( function( response ) {
								$modalInstance.close( {edit: response} ); // param - response data 
							});
					}
				}; 
		
				$scope.discardChanges = function() { 
					
					$modalInstance.dismiss( null );  // param - response data
				}; 
				
				$scope.deleteUser = function() {
					
					if (confirm('Proceed to deleting user: \"' + data.unit_name + '\"? This cannot be undone.')) {
						
						$http.post( './post/delete_user', { user : data } )
							.success( function( response ) {
                                
                                var callback = function( finalCallback ) {
                                    
                                    if( finalCallback ) finalCallback();
                                    
                                    $modalInstance.close( {
                                        delete: response, 
                                        index: index
                                    }); 
                                }
                                
                                app.init( true );
				                app.deleteTable( data.unit_id , callback );
							});
					}
				}
		}]);
})();