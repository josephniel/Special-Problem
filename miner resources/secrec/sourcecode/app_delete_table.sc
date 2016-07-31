import stdlib;
import table_database;
import shared3p;
import shared3p_table_database;

domain pd_shared3p shared3p;

void main() {
    
    // INITIALIZE DATABASE NAME
    public string dataStore = "DS1";
        
    // RETRIEVE TABLE NAME
    uint8 table_name = argument( "table_name" );
    public string table = _vectorToString( {table_name} );
    
    // OPEN DATABASE CONNECTION
    tdbOpenConnection( dataStore );
 
        // CHECK IF TABLE EXISTS
        if( tdbTableExists( dataStore, table ) ) {

            // DELETE TABLE
            print( "[app_delete_table.sc] Deleting existing table: ", table );
            tdbTableDelete( dataStore, table );
        }
    
        // PUBLISH NAME OF TABLE DELETED
        publish( "table_name", table_name );
    
    // CLOSE DATABASE CONNECTION
    tdbCloseConnection( dataStore );     
}