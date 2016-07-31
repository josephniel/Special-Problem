(function() {
    "use strict";
	
	angular
		.module( "tuazon.genomicdst.user", 
				["mm.foundation", "tuazon.genomicdst"] )
	
		.controller( "userCtrl",
			["$http", "$scope",
			function( $http, $scope ) { 
		
                $http.get( './user/get/home' )
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
                    return !( ($scope.start + 10) <= $scope.max_log );
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
                        
                        $http.post( './user/post/update_log', { start: tempStart, end: tempEnd } )
                            .success( function( data ) {

                                $scope.logs = data.log;

                                $scope.start = tempStart;
                                $scope.end = tempEnd;
                             });
                    }
                }
		}])
	
		.controller( "userDiseaseSelectionCtrl",
			["$http", "$scope", 
			function( $http, $scope ) {
		
				$http.get( './get/diseases' )
                    .success( function( data ) {
						$scope.diseases = data.diseases;
                        $scope.numOfDiseases = $scope.diseases.length;
                    });
                
                $scope.isDiseaseSelected = function( index ) {
                    return ( $scope.diseaseName == $scope.diseases[index].disease_name );
                }
                
                $scope.diseaseName = "";
                $scope.radioToggled = function( index ) {
                    $scope.diseaseName = $scope.diseases[index].disease_name;
                }
		}])
    
        .controller( "userPatientUploadCtrl",
            ["$http", "$scope", "$timeout", "alertFactory",
            function( $http, $scope, $timeout, alertFactory ) {

                $http.get( './get/upload' )
                    .success( function( data ) {
						$scope.unit_table_name = data.unit_table_name;
                    });
                
                $scope.isUploaded = false;
                $scope.processVCF = function( event ) {
                    
                    var input = event.target;
                    var reader = new FileReader();
                    
                    var callback = function( finalCallback ) {
                            
                        $http.post( './post/upload_time', { upload_time: new Date().toLocaleString() } )
                            .success( function( data ) {
                            
                                alertFactory.addAlert( data.alert.type, data.alert.msg );
                                $timeout( function() {
                                    alertFactory.closeAlert();
                                }, 5000);

                                $scope.isUploaded = true;
                            
                                if( finalCallback ) finalCallback();
                            });
                    }
                    
                    reader.onload = function() {
                        
                        app.init( true, true );
                        app.storeGenotype( reader.result, $scope.unit_table_name, callback );
                    }
                    
                    reader.readAsText( input.files[0] );
                }
        }])
    
        .controller( "userPatientRetrieveCtrl",
                ["$http", "$scope", "$timeout", "$cookies", "alertFactory",
                function( $http, $scope, $timeout, $cookies, alertFactory ) {
                    
                $http.get( './get/retrieve' )
                    .success( function( data ) {
				        $scope.unit_table_name = data.unit_table_name;
                        $scope.marker_table_name = data.marker_table_name;
                        $scope.disease_name = data.disease_name;
                        $scope.upload_time = data.upload_time;
                        $scope.weight_multiplier = data.weight_multiplier;
                    });
                   
                $scope.isFinished = false;
                $scope.isReady = function() {
                    return ( $scope.marker_table_name != 0 );
                }
                
                $scope.retrieveResult = function() {
                    
                    var callback = function( coefficient, intercept ) {
                        
                        $http.get( './get/retrieve_multiplier' )
                            .success( function( data ) {
                                
                                $scope.isFinished = true;
                            
                                $scope.coefficient = 
                                    parseFloat( parseFloat( intercept ) / parseInt( data.weight_multiplier ) ) +
                                    parseFloat( parseInt( coefficient ) / parseInt( data.weight_multiplier ) );
                                
                                $( ".coefficient-result" ).slideDown();
                            
                                $cookies.putObject( "generate_data", {
                                    coefficient: $scope.coefficient,
                                    disease_name: $scope.disease_name,
                                    time_calculated: new Date().toLocaleString()
                                });
                            });
                    }
                    
                    app.init( true );
                    app.retrieveComputationResult( $scope.unit_table_name, $scope.marker_table_name, $scope.weight_multiplier, callback );
                }
                    
        }])
    
        .controller( "userPatientGenerateCtrl",
                ["$scope", "$cookies",
                function( $scope, $cookies ) {
                  
                $scope.generate_data = $cookies.getObject( "generate_data" ); 
                    
                $scope.isFinished = false;
                $scope.generateReport = function() {
                    
                    $( ".loader" ).fadeIn(function() {
                        var pdfName = (new Date().toLocaleString())
                                        .replace( "/", "" )
                                        .replace( "/", "" )
                                        .replace( ",", "" )
                                        .replace( ":", "" )
                                        .replace( ":", "" )
                                        .replace( " ", "" ) + ".pdf"

                        pdfMake.createPdf({
                            content: [
                                {
                                    columns: [
                                        { image: 'upmLogo', width: 70, height: 70 },
                                        { text: 'Privacy-preserving Genomic Disease Susuceptibility Testing using Secure Multiparty Computation', style: 'title' },
                                        { image: 'dpsmLogo', width: 85, height: 70 }
                                    ]
                                },
                                { text: "Patient Information", style: 'header' },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [ '30%', '70%' ],
                                        body: [
                                            [ 
                                                { text: "Patient Name", style: 'tableDataAttr' }, 
                                                { text: $scope.patient.name, style: 'tableDataVal' } 
                                            ],
                                            [ 
                                                { text: "Patient Age", style: 'tableDataAttr' }, 
                                                { text: $scope.patient.age.toString(), style: 'tableDataVal' } 
                                            ],
                                            [ 
                                                { text: "Patient Sex", style: 'tableDataAttr' }, 
                                                { text: $scope.patient.sex, style: 'tableDataVal' } 
                                            ],
                                            [ 
                                                { text: "Remarks", style: 'tableDataAttr' }, 
                                                { text: $scope.patient.remarks, style: 'tableDataVal' } 
                                            ]
                                        ]
                                    }
                                },
                                { text: "Genomic Risk Information", style: 'header' },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [ '30%', '70%' ],
                                        body: [
                                            [
                                                { text: "Disease Name", style: 'tableDataAttr' }, 
                                                { text: $scope.generate_data.disease_name, style: 'tableDataVal' } 
                                            ],
                                            [
                                                { text: "Generated last", style: 'tableDataAttr' }, 
                                                { text: $scope.generate_data.time_calculated, style: 'tableDataVal' } 
                                            ],
                                            [
                                                { text: "Risk Coefficient", style: [ 'tableDataAttr', 'special' ] }, 
                                                { text: ($scope.generate_data.coefficient).toString(), style: [ 'tableDataVal', 'special' ] } 
                                            ]
                                        ]
                                    }
                                }
                            ],
                            styles: {
                                title: {
                                    bold: true,
                                    alignment: 'center',
                                    fontSize: 18
                                },
                                header: {
                                    bold: true,
                                    fontSize: 18,
                                    margin: [ 0, 20, 0, 10 ]
                                },
                                tableHeaderAttr: {
                                    bold: true,
                                    alignment: 'right', 
                                    margin: 5
                                },
                                tableHeaderVal: {
                                    bold: true,
                                    alignment: 'left', 
                                    margin: 5
                                },
                                tableDataAttr: {
                                    alignment: 'right', 
                                    margin: 5
                                },
                                tableDataVal: {
                                    alignment: 'left', 
                                    margin: 5
                                },
                                special: {
                                    fontSize: 14,
                                    bold: true
                                }
                            },
                            images: {
                                dpsmLogo: 'data:image/png;base64,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',
                            }
                        }).getDataUrl( function( outDoc ) {
                            
                            $( ".loader" ).fadeOut( function() {
                                $( "#pdf-iframe" ).attr( "src", outDoc );
                                $( "#generate-form" ).slideUp( function() {
                                    $( "#pdf-iframe" ).slideDown();
                                });
                            });
                        });
                    });
                    $scope.isFinished = true;
                    $cookies.remove( "generate_data" );
                }
        }]);
	
})();