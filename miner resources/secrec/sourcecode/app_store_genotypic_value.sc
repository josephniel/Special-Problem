import stdlib;
import shared3p;
import shared3p_table_database;
import table_database;

domain pd_shared3p shared3p;

void main() {

    // INITIALIZE DATABASE NAME
    public string dataStore = "DS1";
        
    // RETRIEVE UNIT TABLE NAME
    uint8 [[1]] table_name = argument( "table_name" );
    public string table = _vectorToString( table_name );

    // OPEN DATABASE CONNECTION
    tdbOpenConnection( dataStore );
 
        // GET CURRENT GENOTYPE ROW COUNT
        // NOTE: RUN_CODE IS EXECUTED PER GENOTYPE ROW
        pd_shared3p uint64 marker_count = argument( "marker_count" );
        uint64 marker_start_count = 0;

        // CHECK IF TABLE EXISTS FOR THE FIRST RUN
        if( tdbTableExists( dataStore, table ) && declassify( marker_count ) == marker_start_count ) {

            // DELETE TABLE IF PRESENT FOR THE FIRST RUN
            print( "[app_store_genotypic_value.sc] Deleting existing table." );
            tdbTableDelete( dataStore, table );
        }

        // CHECK IF TABLE DOES NOT EXIST
        if ( !tdbTableExists( dataStore, table ) ) {

            // PREPARE TABLE COLUMNS BY CREATING A VECTOR MAP
            uint parameters = tdbVmapNew();

            // CHROMOSOME COLUMN
            pd_shared3p uint8 vtype_chromosome;
            tdbVmapAddType( parameters, "types", vtype_chromosome );
            tdbVmapAddString( parameters, "names", "chromosome" );

            // POSITION COLUMN
            pd_shared3p uint32 vtype_position;
            tdbVmapAddType( parameters, "types", vtype_position );
            tdbVmapAddString( parameters, "names", "position" );

            // NUCLEOTIDE A COUNT COLUMN
            pd_shared3p uint8 vtype_a;
            tdbVmapAddType( parameters, "types", vtype_a );
            tdbVmapAddString( parameters, "names", "nucleotide_a" );

            // NUCLEOTIDE C COUNT COLUMN
            pd_shared3p uint8 vtype_c;
            tdbVmapAddType( parameters, "types", vtype_c );
            tdbVmapAddString( parameters, "names", "nucleotide_c" );

            // NUCLEOTIDE T COUNT COLUMN
            pd_shared3p uint8 vtype_t;
            tdbVmapAddType( parameters, "types", vtype_t );
            tdbVmapAddString( parameters, "names", "nucleotide_t" );

            // NUCLEOTIDE G COUNT COLUMN
            pd_shared3p uint8 vtype_g;
            tdbVmapAddType( parameters, "types", vtype_g );
            tdbVmapAddString( parameters, "names", "nucleotide_g" );

            // CREATE NEW TABLE
            print( "[app_store_genotypic_value.sc] Creating new table." );
            tdbTableCreate( dataStore, table, parameters );

            // CLEAR VECTOR MAP VALUE
            tdbVmapClear( parameters );
            
            // DELETE VECTOR MAP
            tdbVmapDelete( parameters );
        }

        print( "[app_store_genotypic_value.sc] Populating table..." );

        // PREPARE TABLE ROW TO INSERT BY CREATING A VECTOR MAP
        uint parameters = tdbVmapNew();

        // CHROMOSOME INPUT VALUE
        pd_shared3p uint8 input_chromosome = argument( "input_chromosome" );
        tdbVmapAddValue( parameters, "values", input_chromosome );

        // POSITION INPUT VALUE
        pd_shared3p uint32 input_position = argument( "input_position" );
        tdbVmapAddValue( parameters, "values", input_position );

        // NUCLEOTIDE A COUNT INPUT VALUE
        pd_shared3p uint8 input_a = argument( "input_a" );
        tdbVmapAddValue( parameters, "values", input_a );

        // NUCLEOTIDE C COUNT INPUT VALUE
        pd_shared3p uint8 input_c = argument( "input_c" );
        tdbVmapAddValue( parameters, "values", input_c );

        // NUCLEOTIDE T COUNT INPUT VALUE
        pd_shared3p uint8 input_t = argument( "input_t" );
        tdbVmapAddValue( parameters, "values", input_t );

        // NUCLEOTIDE G COUNT INPUT VALUE
        pd_shared3p uint8 input_g = argument( "input_g" );
        tdbVmapAddValue( parameters, "values", input_g );

        // INSERT MAPPED VALUES TO DATABASE TABLE
        print( "[app_store_genotypic_value.sc] Inserting row ", declassify( marker_count ) );  
        tdbInsertRow( dataStore, table, parameters );

        // CLEAR VECTOR MAP VALUE
        tdbVmapClear( parameters );

        // DELETE VECTOR MAP
        tdbVmapDelete( parameters );

        // PUBLISH CURRENT ROW COUNT
        public uint row_count = tdbGetRowCount( dataStore, table ); 
        publish( "row_count", row_count );

    // CLOSE DATABASE CONNECTION
    tdbCloseConnection( dataStore );     
}