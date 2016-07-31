(function() {
    "use strict";
	
	angular
		.module( "tuazon.genomicdst.admin", 
				["mm.foundation", "tuazon.genomicdst"] )
	
		.controller( "adminCtrl",
			["$http", "$scope", "$filter", "$timeout", 
			function( $http, $scope, $filter, $timeout ) { 
		
			
				
		}])
		
		.controller( "adminDiseaseCtrl",
			[ "$http", "$scope", "$timeout", "$filter", "alertFactory",
			function( $http, $scope, $timeout, $filter, alertFactory ) { 
		
				$scope.alerts = alertFactory.alerts;
				$scope.closeAlert = alertFactory.closeAlert;
				
				$http.get( './get/diseases' )
                    .success( function( data ) {
                        $scope.diseases = data.diseases;
						$scope.noOfDisease = ($scope.diseases.length + " disease" + (( $scope.diseases.length > 1 ) ? "s" : "") );
                    });
				
				$scope.addDiseaseName = function() {
					
					$http.post( './post/add_disease', { disease_name: $scope.disease_name } )
						.success( function( data ) {
						
							$scope.disease_name = "";
						
							angular.copy( data.diseases, $scope.diseases );
						
							alertFactory.addAlert( data.alert.type, data.alert.msg );
							$timeout( function() {
								alertFactory.closeAlert();
							}, 5000);
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
					
					var disease_name = $scope.diseases[index].disease_name;
					if (confirm('Are you sure you want to delete ' + disease_name + ' from the database?')) {
						
						$http.post( './post/delete_disease', { disease_name: disease_name } )
							.success( function( data ) {

								$scope.diseases.splice( index, 1 );

								alertFactory.addAlert( data.alert.type, data.alert.msg );
								$timeout( function() {
									alertFactory.closeAlert();
								}, 5000);
							});
					} 
				}
		}])

		.controller( "adminMarkersCtrl",
			[ "$http", "$scope", "$timeout", "$filter", "alertFactory", "$modal", "$log",
			function( $http, $scope, $timeout, $filter, alertFactory, $modal, $log  ) { 
		
				$scope.alerts = alertFactory.alerts;
				$scope.closeAlert = alertFactory.closeAlert;
				
				$http.get( './get/markers' )
                    .success( function( data ) {
						$scope.diseases = data.diseases;
						$scope.currentDisease = $scope.diseases[0];
                        $scope.markers = data.markers;
						$scope.updateMarkers();
                    });
				
				$scope.order = function( predicate ) {
					
					$scope.predicate = predicate;
					$scope.currentMarkers = $filter( "orderBy" )( $scope.currentMarkers, predicate, $scope.reverse );
					$scope.reverse = ( $scope.predicate === predicate ) ? !$scope.reverse : false;
				}
				
				$scope.markerCount = 0;
				$scope.updateMarkers = function() {
					
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
					$scope.order( 'chromosome' );
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
								$scope.updateMarkers();
								
								alertFactory.addAlert( data.alert.type, data.alert.msg );
								$timeout( function() {
									alertFactory.closeAlert();
								}, 5000);
							}, 
							function( data ) { // DISMISS CALLBACK / CLOSE PROMISE REJECTED
								return;
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
									$scope.updateMarkers();
									
									alertFactory.addAlert( data.edit.alert.type, data.edit.alert.msg );
									$timeout( function() {
										alertFactory.closeAlert();
									}, 5000);
								}
								else if( angular.isDefined( data.delete ) ) {
									
									$scope.markers.splice( data.index, 1 );
									
									$scope.reverse = !$scope.reverse;
									$scope.updateMarkers();
									
									alertFactory.addAlert( data.delete.alert.type, data.delete.alert.msg );
									$timeout( function() {
										alertFactory.closeAlert();
									}, 5000);
								}
							}, 
							function( data ) { // DISMISS CALLBACK / CLOSE PROMISE REJECTED
								return;
							}
						);
				}	
				
		}])
	
		.controller( 'adminAddMarkerModal', 
			[ "$scope", "$modalInstance", "$http", "data",
			function( $scope, $modalInstance, $http, data ) { 
		
				$scope.marker = {  };
				$scope.currentDiseaseName = data.disease_name;
				
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
						$scope.noOfUser = ($scope.users.length + " user" + (( $scope.users.length > 1 ) ? "s" : "") );
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
									
									angular.copy( data.edit.users, $scope.users );
								
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
								return;
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
								$modalInstance.close( {delete: response, index: index} ); // param - response data 
							});
					}
				}
		}]);
})();