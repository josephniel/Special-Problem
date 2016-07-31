(function(app, hosts, sm, $){
    
    var hosts = hosts.addresses;
    var public = sm.types.base;
    var private = sm.types.shared3p;

    var servers = null;
	
    app.init = function( showLoad, hasUploadButton ) {
        
        if( showLoad ) $( ".loader" ).fadeIn();
        
        if( hasUploadButton ) $( "#upload-button" ).addClass( "upload-disabled" );
        
        $(window).on( "allDone", function () {
            
            if( showLoad ) $( ".loader" ).fadeOut();
            
            if( hasUploadButton ) $( "#upload-button" ).removeClass( "upload-disabled" );
            
            $( "#slide-up-button" ).slideUp();
            
            app.debug("All done!");
            serversDisconnect();
        });
    };

    app.log = function(txt) {
        $( ".console" ).append( "\n[" + new Date().toLocaleTimeString() + "][INFO] | " + txt );
        $( ".console" ).scrollTop( $( ".console" )[0].scrollHeight - $( ".console" ).height() );
        //console.log();
    };
    
    app.debug = function(txt) {
        $( ".console" ).append( "\n[" + new Date().toLocaleTimeString() + "][DEBUG]| " + txt );
        $( ".console" ).scrollTop( $( ".console" )[0].scrollHeight - $( ".console" ).height() );
        //console.debug();
    };

    app.error = function(txt) {
        $( ".console" ).append( "\n[" + new Date().toLocaleTimeString() + "][ERROR]| " + txt );
        $( ".console" ).scrollTop( $( ".console" )[0].scrollHeight - $( ".console" ).height() );
        //console.error();
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
        else { // Was already connected. Execute callback.
            
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
                
    var parse_genotype = function( genotype ) {
                    
        var genotype_object = { a: 0, c: 0, t: 0, g: 0 }
        for( var i = 0; i < genotype.length; i++ ) {
            if( genotype.substr( i, 1 ) == "A" ) {
                genotype_object.a += 1;
            }
            else if( genotype.substr( i, 1 ) == "C" ) {
                genotype_object.c += 1;
            }
            else if( genotype.substr( i, 1 ) == "T" ) {
                genotype_object.t += 1;
            }
            else {
                genotype_object.g += 1;
            }
        }
        return genotype_object;
    }
    
    var parseVCF = function( vcf ) {
                    
        // creates an array of rows
        var vcf_rows = vcf.split("\n");
                    
        // constants
        var current_index = 0;
        var latest_version = "VCF4.3";
                    
        // parse header rows
        while( true ) {
                        
            if( vcf_rows[current_index].substr( 0, 2 ) != "##" ) {
                break;
            }
                        
            // TODO
                        
            current_index++;
        }
                    
        // get column name row
        while( true ) {
                        
            //app.log( "Processing variant row " + (current_index + 1) );
            
            if( vcf_rows[current_index].substr( 0, 1 ) == "#" ) {
                break;
            }
            current_index++;
        }
                    
        // constants
        var column_array = vcf_rows[current_index].split("\t");
                    
        var chrom_index = column_array.indexOf( "#CHROM" );
        var pos_index = column_array.indexOf( "POS" );
        var ref_index = column_array.indexOf( "REF" );
        var alt_index = column_array.indexOf( "ALT" );
        var format_index = column_array.indexOf( "FORMAT" );
                    
        // frees up local browser space to prevent out of memory error
        delete window.column_array;
                    
        // check if essesntial column is missing
        if( chrom_index == -1 ||
            pos_index == -1 ||
            ref_index == -1 ||
            alt_index == -1 ||
            format_index == -1
          ) {
                        
            app.error( "VCF file has incomlete columns! Aborting process." );
            return null;
        }
                    
        // update current_index
        current_index++;
                    
        // prepare object to return
        var genotype_index = null;
                    
        var genotype = [];
        while( current_index < vcf_rows.length - 1 ) {
                        
            var current_row_array = vcf_rows[current_index].split("\t");
                        
            var reference = current_row_array[ref_index];
            var alteration = current_row_array[alt_index];
            var format = current_row_array[format_index];
            var patient_info = current_row_array[format_index + 1];
                        
            // frees up local browser space to prevent out of memory error
            delete window.current_row_array;
                        
            if( genotype_index == null ) {
                            
                var format_elements = format.split(":");
                            
                // frees up local browser space to prevent out of memory error;
                delete window.format;
                            
                genotype_index = format_elements.indexOf( "GT" );
                            
                // frees up local browser space to prevent out of memory error;
                delete window.format_elements;
            }
                        
            var genotype_array = patient_info.split( ":" )[genotype_index].split("\\").join("|").split("|");
                        
            // frees up local browser space to prevent out of memory error;
            delete window.patient_info;
                        
            var current_genotype = "";
            for( var i = 0; i < genotype_array.length; i++ ) {
                            
                var current_genotype_strand = parseInt( genotype_array[i] );
                            
                var current_nucleotide = "";
                if( current_genotype_strand == 0 ) {
                    current_nucleotide = reference;
                                
                    // frees up local browser space to prevent out of memory error;
                    delete window.reference;
                }
                else {
                    var alteration_array = alteration.split(",");
                                
                    // frees up local browser space to prevent out of memory error;
                    delete window.alteration;
                                
                    current_nucleotide = alteration_array[current_genotype_strand - 1];
                                
                    // frees up local browser space to prevent out of memory error;
                    delete window.alteration_array;
                }
                            
                // frees up local browser space to prevent out of memory error
                delete window.current_genotype_strand;
                            
                current_genotype = current_genotype.concat( current_nucleotide );
                            
                // frees up local browser space to prevent out of memory error
                delete window.current_nucleotide;
            }
                        
            current_genotype = parse_genotype( current_genotype );
                        
            var variant_row = {
                chromosome: current_row_array[chrom_index],
                position: current_row_array[pos_index],
                genotype: current_genotype,
            };
                        
            // frees up local browser space to prevent out of memory error
            delete window.current_genotype;
                        
            genotype = genotype.concat( variant_row );
                        
            // frees up local browser space to prevent out of memory error
            delete window.variant_row;
                        
            current_index++;
        }
                    
        return genotype;
    }
    
    var storeGenotypicValue = function( genotypes, current_index, unit_table, callback ) {
        
        serversConnect( function( err_msg ) {

            // If message is present in connectCall parameter 
            // at a function call, then error is present. 
            if( err_msg ) {

                app.error( err_msg );
                return;
            }

            // Else, proceed.
            app.log( '[storeGenotypicValue()] Processing genotype ' + (current_index + 1) + '.' );

            var arguments = {};

            arguments["proxyParams"] = { "codefile": "app_store_genotypic_value.sb" };

            var randomNumber = 10;
            
            // Handle table name
            table_name = new public.Uint8Array( 1 );
            table_name.set( 0, new BigInteger( unit_table + "", randomNumber ) );
          
            // Handle chromosome 
            public_value = new public.Uint8Array( 1 );
            public_value.set( 0, new BigInteger( genotypes[current_index].chromosome + "", randomNumber ) );
            var input_chromosome = new private.Uint8Array( public_value );
                
            // Handle position
            public_value = new public.Uint32Array( 1 );
            public_value.set( 0, new BigInteger( genotypes[current_index].position + "", randomNumber ) );
            var input_position = new private.Uint32Array( public_value );
                
            // Handle marker count
            public_value = new public.Uint64Array( 1 );
            public_value.set( 0, new BigInteger( current_index + "", randomNumber ) );
            var marker_count = new private.Uint64Array( public_value );
                
            // Handle genotype
            public_value = new public.Uint8Array( 1 );
            public_value.set( 0, new BigInteger( genotypes[current_index].genotype.a + "", randomNumber ) );
            var input_a = new private.Uint8Array( public_value );
            
            public_value = new public.Uint8Array( 1 );
            public_value.set( 0, new BigInteger( genotypes[current_index].genotype.c + "", randomNumber ) );
            var input_c = new private.Uint8Array( public_value );
            
            public_value = new public.Uint8Array( 1 );
            public_value.set( 0, new BigInteger( genotypes[current_index].genotype.t + "", randomNumber ) );
            var input_t = new private.Uint8Array( public_value );
            
            public_value = new public.Uint8Array( 1 );
            public_value.set( 0, new BigInteger( genotypes[current_index].genotype.g + "", randomNumber ) );
            var input_g = new private.Uint8Array( public_value );
            
            arguments["smParams"] = { 
                "table_name": table_name,
                "input_chromosome": input_chromosome,
                "input_position": input_position,
                "input_a": input_a,
                "input_c": input_c,
                "input_t": input_t,
                "input_g": input_g,
                "marker_count": marker_count,
            };
            
            app.log( '[storeGenotypicValue()] Storing genotypic value of genotype ' + (current_index + 1) + '.' );
                
            servers.emit( "run_code", arguments, function( data ) {
                    
                var row_count = parseInt( data["row_count"][0].toString() );
                    
                app.log( '[storeGenotypicValue()] Successfully stored genotypic value of genotype ' + row_count + '.' );
                    
                if( row_count == genotypes.length ) { 
                        
                    if( callback ) callback( function() {
                            
                        $( window ).trigger( "allDone" );
                    });
                }
                else {
                    storeGenotypicValue( genotypes, current_index + 1, unit_table, callback );
                }
            });
        });
    }
    
    app.storeGenotype = function( file_string, unit_table, callback ) {
    
        var genotypes = parseVCF( file_string );
        
        storeGenotypicValue( genotypes, 0, unit_table, callback );
    }
    
    app.retrieveComputationResult = function( unit_table, marker_table, weight_multiplier, callback ) {
        
         serversConnect( function( err_msg ) {

            // If message is present in connectCall parameter 
            // at a function call, then error is present. 
            if( err_msg ) {

                app.error( err_msg );
                return;
            }

            app.log( '[retrieveComputationResult()] Retrieving Sharemind computation result.' );
             
            var arguments = {};

            arguments["proxyParams"] = { "codefile": "app_calculate_risk.sb" };

            var randomNumber = 10;
            
            // Handle unit table name
            var unit_table_name = new public.Uint8Array( 1 );
            unit_table_name.set( 0, new BigInteger( unit_table + "", randomNumber ) );
            
            // Handle marker table name
            var marker_table_name = new public.Uint8Array( 1 );
            marker_table_name.set( 0, new BigInteger( marker_table + "", randomNumber ) );
             
            var public_value = new public.Float64Array( 1 );
            public_value.set( 0, weight_multiplier );
            var weight_multiplier_value = new private.Float64Array( public_value );
             
            arguments["smParams"] = { 
                "unit_table_name": unit_table_name,
                "marker_table_name": marker_table_name,
                "weight_multiplier": weight_multiplier_value
            };
             
            servers.emit( "run_code", arguments, function( data ) { 
            
                var coefficient = data["coefficient"][0].toString();
                var intercept = data["intercept"][0].toString();
                
                $( window ).trigger( "allDone" );
                
                if( callback ) callback( coefficient, intercept );
            });
             
         });
    }
    
})(this.app = ( this.app === undefined ) ? {} : this.app, hosts, sm, jQuery);
