psql -U pgadmin -l
psql -U holtspalding -d covizdb
DELETE FROM map_color_data *;
SELECT * FROM map_color_data;
DROP TABLE map_color_data,county_graph_data,state_graph_data;
SELECT info FROM map_color_data WHERE CAST(dateid AS VARCHAR) = '66';
