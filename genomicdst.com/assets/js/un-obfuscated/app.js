(function() {
    "use strict";
	
	angular
		.module( "tuazon.genomicdst", 
				["mm.foundation"] )
		
		.factory( "alertFactory", function() { 
			return {
				alerts: [],
				addAlert: function ( type, msg ) {
						
					this.alerts.push({ 
						type: type, 
						msg: msg
					});
				},
				closeAlert: function( index ) {
					this.alerts.splice( index, 1 );
				}
			};
		})
	
		.controller( "alertCtrl", 
			["$scope", "$timeout", "alertFactory",
			function( $scope, $timeout, alertFactory ) { 
				
				$scope.alerts = alertFactory.alerts;
				
				$scope.credentials = {};
				
				$scope.initializeAlert = function( settings ) {
					
					settings = window[settings];
					if( settings.alert != undefined ) {
						var alertIndex = alertFactory.addAlert( settings.alert.type, settings.alert.msg );
						if( settings.type == "login" ) {
							$scope.credentials = { username: settings.email };
						} else if( settings.type == "signup" ) {
							$scope.credentials = { 
								name: settings.name, 
								email: settings.email
							};
						}
						$timeout( function() {
							alertFactory.closeAlert( alertIndex );
						}, 5000);
					}
				}
		}]);
	
})();