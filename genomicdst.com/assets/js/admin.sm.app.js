(function(app, hosts, sm, $){
    
    var hosts = hosts.addresses;
    var public = sm.types.base;
    var private = sm.types.shared3p;

    var servers = null;
	
    app.init = function( showLoad ) {
        
        if( showLoad ) $( ".loader" ).fadeIn();
        
        $(window).on( "allDone", function () {
            
            if( showLoad ) $( ".loader" ).fadeOut();
            
            app.debug("All done!");
            serversDisconnect();
        });
    };
    
    app.debug = function(txt) {
        console.debug("[DEBUG]| " + txt);
    };

    app.log = function(txt) {
        console.log("[INFO] | " + txt);
    };

    app.error = function(txt) {
        console.error("[ERROR]| " + txt);
    };

    function serversConnect( callback ) {
        
        if (servers === null) {
      
            app.debug("Sharemind not yet connected.");

            try {
        
                app.log("Connecting to Sharemind.");

                var sucCall = function() {  // success callback
           
                    app.log("Connected to Sharemind.");

                    var bytes = new public.Uint32Array(1);
                    bytes.set(0, 32);  // 32 random bytes needed.

                    var args = {};

                    args["proxyParams"] = {"codefile": "get_random.sb"}

                    var smParams = {};
                    smParams["bytes"] = bytes;
                    args["smParams"] = smParams;

                    servers.emit( "run_code", args, function (data) {
                
                        app.log("Got randomness for PRNG.");

                        sm.types.prng = new PRNG(data.random);

                        if (sm.types.prng) {
                                
                            app.log("Ready to send data.");
                                
                            callback(); // Successfully connected. Execute callback.
                        }
                        else {
                                
                            app.log("Failed to create PRNG!");
                                
                            serversDisconnect();
                            return;
                        }
                    });
                };
                
                var errCall = function(error) {  // on error function
            
                    app.error( error );
                    callback( error );
                    
                    $(window).trigger("allDone");
                };
                
                servers = sm.ctrl.connect( hosts, sucCall, errCall );
            } 
            catch (err) {
            
                app.debug("Failed to connect to Sharemind: " + err);
                callback("Failed to connect to Sharemind: " + err);
        
                serversDisconnect();
                return;
            }
        }
        else { 
            callback();
        }
    }

    function serversDisconnect() {
        
        if (servers != null) { // If it's not currently disconnected.  
            
            app.log("Disconnecting from Sharemind.");
            
            servers.disconnect();
            
            delete servers;
            servers = null;
            
            app.log("Disconnected from Sharemind.");
        }
    }
    
    app.deleteTable = function( table, callback ) {
        
        app.log( '[deleteDiseaseTable()] FUNCTION INITIALIZED.' );
        
        serversConnect( function( err_msg ) { 
            
            // If message is present in connectCall parameter 
            // at a function call, then error is present. 
            if( err_msg ) {

                app.error( err_msg );
                return;
            }

            // Else, proceed.
            app.log( '[deleteDiseaseTable()] DELETING TABLE {' + table + '}.' );
            
            var arguments = {};

            arguments["proxyParams"] = { "codefile": "app_delete_table.sb" };
            
            // Handle table name
            var table_name = new public.Uint8Array( 1 );
            table_name.set( 0, new BigInteger( table + "", 10 ) )
            
            arguments["smParams"] = { "table_name": table_name };
            
            servers.emit( "run_code", arguments, function( data ) {
                    
                var table_name = parseInt( data["table_name"][0].toString() );
                    
                app.log( '[storeMarkers()] SUCCESSFULLY DELETED TABLE \{' + table + '\}.' );
                
                if( callback ) callback( function() {
                    $( window ).trigger( "allDone" );
                });
            });
        });
    }
    
    app.storeMarkers = function( markers, currentIndex, callback ) {
        
        app.log( '[storeMarkers()] FUNCTION INITIALIZED.' );
        
        serversConnect( function( err_msg ) {

            // If message is present in connectCall parameter 
            // at a function call, then error is present. 
            if( err_msg ) {

                app.error( err_msg );
                return;
            }

            // Else, proceed.
            app.log( '[storeMarkers()] PROCESSING MARKERS.' );

            var arguments = {};

            arguments["proxyParams"] = { "codefile": "app_store_markers.sb" };

            var randomNumber = 10;
            
            // Handle table name
            var table_name = new public.Uint8Array( 1 );
            table_name.set( 0, new BigInteger( markers[currentIndex].disease_id, randomNumber ) )
          
                /*
                * NOTE:
                * The BigInteger value accepts only String as the first parameter;
                * an error will occur when a passed variable is not of type String.
                */
                // Handle chromosome 
                public_value = new public.Uint8Array( 1 );
                public_value.set( 0, new BigInteger( markers[currentIndex].chromosome + "", randomNumber ) );
                var input_chromosome = new private.Uint8Array( public_value );
                
                // Handle position
                public_value = new public.Uint32Array( 1 );
                public_value.set( 0, new BigInteger( markers[currentIndex].position + "", randomNumber ) );
                var input_position = new private.Uint32Array( public_value );
                
                // Handle nucleotides
                var risk_snp = markers[currentIndex].risk_snp;
                var nuc_a = 0,
                    nuc_c = 0,
                    nuc_t = 0,
                    nuc_g = 0;
            
                switch( risk_snp ) {
                    case "A": nuc_a = 1; break;
                    case "C": nuc_c = 1; break;
                    case "T": nuc_t = 1; break;
                    case "G": nuc_g = 1; break;
                }
            
                public_value = new public.Uint8Array( 1 );
                public_value.set( 0, new BigInteger( nuc_a + "", randomNumber ) );
                var input_a = new private.Uint8Array( public_value );
            
                public_value = new public.Uint8Array( 1 );
                public_value.set( 0, new BigInteger( nuc_c + "", randomNumber ) );
                var input_c = new private.Uint8Array( public_value );
            
                public_value = new public.Uint8Array( 1 );
                public_value.set( 0, new BigInteger( nuc_t + "", randomNumber ) );
                var input_t = new private.Uint8Array( public_value );
            
                public_value = new public.Uint8Array( 1 );
                public_value.set( 0, new BigInteger( nuc_g + "", randomNumber ) );
                var input_g = new private.Uint8Array( public_value );
                    
            
                // Handle weight
                public_value = new public.Float64Array( 1 );
                public_value.set( 0, markers[currentIndex].odds_ratio );
                var input_odds_ratio = new private.Float64Array( public_value );
                
                // Handle marker count
                public_value = new public.Uint8Array( 1 );
                public_value.set( 0, new BigInteger( currentIndex + "", randomNumber ) );
                var marker_count = new private.Uint8Array( public_value );
                
                arguments["smParams"] = { 
                    "table_name": table_name,
                    "input_chromosome": input_chromosome,
                    "input_position": input_position,
                    "input_a": input_a,
                    "input_c": input_c,
                    "input_t": input_t,
                    "input_g": input_g,
                    "input_odds_ratio": input_odds_ratio,
                    "marker_count": marker_count,
                };
            
                app.log( '[storeMarkers()] STORING MARKER ' + (currentIndex + 1) + '.' );
                
                servers.emit( "run_code", arguments, function( data ) {
                    
                    var row_count = parseInt( data["row_count"][0].toString() );
                    
                    app.log( '[storeMarkers()] SUCCESSFULLY STORED MARKER ' + row_count + '.' );
                    
                    if( row_count == markers.length ) { 
                        
                        if( callback ) callback( function() {
                            
                            $( window ).trigger( "allDone" );
                        });
                    }
                    else {
                        app.storeMarkers( markers, currentIndex + 1, callback );
                    }
                });
        });
    }
    
})(this.app = ( this.app === undefined ) ? {} : this.app, hosts, sm, jQuery);
