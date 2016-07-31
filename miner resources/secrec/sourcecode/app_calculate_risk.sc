import stdlib;
import table_database;
import shared3p;
import shared3p_table_database;
import shared3p_statistics_regression;

domain pd_shared3p shared3p;

void main() {
    
    // INITIALIZE DATABASE NAME
    public string dataStore = "DS1";
    
    // RETRIEVE MARKER TABLE NAME
    uint8 [[1]] marker_table_name = argument( "marker_table_name" );
    public string marker_table = _vectorToString( marker_table_name );
    
    // RETRIEVE UNIT TABLE NAME
    uint8 [[1]] unit_table_name = argument( "unit_table_name" );
    public string unit_table = _vectorToString( unit_table_name );
    
    // OPEN DATABASE CONNECTION
    tdbOpenConnection( dataStore );
    
        // GET MARKER TABLE ROW COUNT
        uint marker_row_count = tdbGetRowCount( dataStore, marker_table );
    
        // GET MARKER TABLE COLUMNS
        pd_shared3p uint8 [[1]] marker_chromosome_column = 
            tdbReadColumn( dataStore, marker_table, "chromosome" );
        pd_shared3p uint32 [[1]] marker_position_column = 
            tdbReadColumn( dataStore, marker_table, "position" );
        pd_shared3p uint8 [[1]] marker_nuc_a_column = 
            tdbReadColumn( dataStore, marker_table, "nucleotide_a" );
        pd_shared3p uint8 [[1]] marker_nuc_c_column = 
            tdbReadColumn( dataStore, marker_table, "nucleotide_c" );
        pd_shared3p uint8 [[1]] marker_nuc_t_column = 
            tdbReadColumn( dataStore, marker_table, "nucleotide_t" );
        pd_shared3p uint8 [[1]] marker_nuc_g_column = 
            tdbReadColumn( dataStore, marker_table, "nucleotide_g" );
        pd_shared3p float64 [[1]] marker_odds_ratio_column = 
            tdbReadColumn( dataStore, marker_table, "odds_ratio" );
    
        // GET UNIT TABLE ROW COUNT
        uint variant_row_count = tdbGetRowCount( dataStore, unit_table );
    
        // GET UNIT TABLE COLUMNS
        pd_shared3p uint8 [[1]] variant_chromosome_column = 
            tdbReadColumn( dataStore, unit_table, "chromosome" );
        pd_shared3p uint32 [[1]] variant_position_column = 
            tdbReadColumn( dataStore, unit_table, "position" );
        pd_shared3p uint8 [[1]] variant_nuc_a_column = 
            tdbReadColumn( dataStore, unit_table, "nucleotide_a" );
        pd_shared3p uint8 [[1]] variant_nuc_c_column = 
            tdbReadColumn( dataStore, unit_table, "nucleotide_c" );
        pd_shared3p uint8 [[1]] variant_nuc_t_column = 
            tdbReadColumn( dataStore, unit_table, "nucleotide_t" );
        pd_shared3p uint8 [[1]] variant_nuc_g_column = 
            tdbReadColumn( dataStore, unit_table, "nucleotide_g" );
    
        // PREPARE VARIABLES FOR REGRESSION COMPUTATION
        pd_shared3p int [[1]] weight_vector (marker_row_count) = 0;
        pd_shared3p int [[1]] genotypic_vector (marker_row_count) = 0;
        pd_shared3p bool [[1]] bool_array (marker_row_count) = true;
    
        // GET WEIGHT MULTIPLIER
        pd_shared3p float64 weight_multiplier = argument( "weight_multiplier" );
    
        // LOOP THROUGH EACH DISEASE MARKER
        for( uint i = 0; i < marker_row_count; i++ ) {
            
            // COMPUTE CURRENT WEIGHT
            pd_shared3p float64 current_weight = ln( marker_odds_ratio_column[i] );
            
            // ADD CURRENT WEIGHT TO VECTOR
            weight_vector[i] = (int)(current_weight*weight_multiplier);
             
            // LOOP THROUGH EACH PATIENT VARIANT
            for( uint j = 0; j < variant_row_count; j++ ) {
                
                // CHECK IF CHROMOSOME AND POSITION ARE THE SAME
                // TODO: CHECK IF PRIVATE DOMAIN COMPARISON IS POSSIBLE
                if( declassify( marker_chromosome_column[i] )  == declassify( variant_chromosome_column[j] ) && 
                    declassify( marker_position_column[i] ) == declassify( variant_position_column[j] )
                  ) {
                    
                    // GET MARKER NUCLEOTIDE
                    pd_shared3p uint8 marker_a = marker_nuc_a_column[i];
                    pd_shared3p uint8 marker_c = marker_nuc_c_column[i];
                    pd_shared3p uint8 marker_t = marker_nuc_t_column[i];
                    pd_shared3p uint8 marker_g = marker_nuc_g_column[i];
                    
                    // GET PATIENT VARIANT GENOTYPE 
                    pd_shared3p uint8 variant_a = variant_nuc_a_column[j];
                    pd_shared3p uint8 variant_c = variant_nuc_c_column[j];
                    pd_shared3p uint8 variant_t = variant_nuc_t_column[j];
                    pd_shared3p uint8 variant_g = variant_nuc_g_column[j];
                    
                    // COMPUTE FOR GENOTYPIC VALUE
                    genotypic_vector[i] =
                        ((int)(marker_a*variant_a)) + 
                        ((int)(marker_c*variant_c)) + 
                        ((int)(marker_t*variant_t)) + 
                        ((int)(marker_g*variant_g));
                    
                    // ESCAPE INNER LOOP
                    break;
                }
            }
        }
    
        // PERFORM SIMPLE LINEAR REGRESSION
        pd_shared3p float64 [[1]] result_vector = 
            simpleLinearRegression( genotypic_vector, weight_vector, bool_array );

        // GET THE INTERCEPT OF THE CURRENT MODEL
        pd_shared3p float64 intercept = result_vector[0];
        
        // GET THE GENOMIC REGRESSION COEFFICIENT
        pd_shared3p int [[1]] vector_product = weight_vector*genotypic_vector;
        pd_shared3p int scalar_sum = sum( vector_product );
    
        // PUBLISH BOTH THE REGRESSION COEFFICIENT 
        // AND THE INTERCEPT OF THE REGRESSION MODEL
        publish( "coefficient", scalar_sum );
        publish( "intercept", intercept );
    
        // DELETE TABLE OF UNIT AFTER PUBLISHING RESULTS
        tdbTableDelete( dataStore, unit_table );
    
    // CLOSE DATABASE CONNECTION
    tdbCloseConnection( dataStore );
}