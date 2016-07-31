#!/bin/sh

nodejs server.js Server1 server1.cfg 8081 127.0.0.1 'get_random.sb,app_calculate_risk.sb,app_delete_table.sb,app_store_genotypic_value.sb,app_store_markers.sb' &
nodejs server.js Server2 server2.cfg 8082 127.0.0.1 'get_random.sb,app_calculate_risk.sb,app_delete_table.sb,app_store_genotypic_value.sb,app_store_markers.sb' &
nodejs server.js Server3 server3.cfg 8083 127.0.0.1 'get_random.sb,app_calculate_risk.sb,app_delete_table.sb,app_store_genotypic_value.sb,app_store_markers.sb' &

wait
