psql -U pgadmin -l
psql -U holtspalding -d covizdb
DELETE FROM map_color_data *;
SELECT * FROM map_color_data;
DROP TABLE map_color_data,county_graph_data,state_graph_data;
SELECT info FROM map_color_data WHERE CAST(dateid AS VARCHAR) = '66';



DROP TABLE county_map_color_data,state_map_color_data,county_graph_data,state_graph_data;


SELECT * FROM county_map_color_data;


SELECT info FROM county_map_color_data WHERE CAST(id AS VARCHAR) = '12220';


heroku pg:push postgresql:///covizdb DATABASE_URL --app coviz-app
export DATABASE_URL="postgres://uqnvkezvcyppfv:d5f734ce003f372a91d122d4af8355c5fc7a2e55b775fb91fe569172dcb9fab9@ec2-54-165-36-134.compute-1.amazonaws.com:5432/d8j6m1a64jstvu"