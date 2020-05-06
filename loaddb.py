#!/usr/bin/python
import psycopg2
from loaddb_config import config
import random,os,json,sys
import pandas as pd 
import numpy as np


def create_tables():
    """ create tables in the PostgreSQL database"""
    commands = (
        """
        CREATE TABLE county_map_color_data (
            id INTEGER NOT NULL PRIMARY KEY,
            info json NOT NULL
        )
        """,
        """
        CREATE TABLE state_map_color_data (
            id INTEGER NOT NULL PRIMARY KEY,
            info json NOT NULL
        )
        """,
        """ CREATE TABLE state_graph_data (
                id INTEGER PRIMARY KEY,
                info json NOT NULL
                )
        """,
        """ CREATE TABLE county_graph_data (
                id INTEGER PRIMARY KEY,
                info json NOT NULL
                )
        """)
    conn = None
    try:
        # read the connection parameters
        params = config()
        # connect to the PostgreSQL server
        conn = psycopg2.connect(database="covizdb", user="holtspalding", password="")
        cur = conn.cursor()
        # create table one by one
        for command in commands:
            cur.execute(command)
        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()


def insert_data_into_tables(data_list, table):
    """ insert multiple vendors into the vendors table  """
    sql = "INSERT INTO " + table + " (id, info) VALUES (%s,%s)"
    conn = None
    try:
        # read database configuration
        params = config()
        # connect to the PostgreSQL database
        conn = psycopg2.connect(database="covizdb", user="holtspalding", password="")
        # create a new cursor
        cur = conn.cursor()
        # execute the INSERT statement
        cur.executemany(sql,data_list)
        # commit the changes to the database
        conn.commit()
        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()


def assign_color(df, max_confirmed, min_confirmed=0):
    county_color_assignments = {}
    state_color_assignments = {}
    state_color_assignments_aggregated = {}
    for index, row in df.iterrows():
        if row["Confirmed"] == 0:
            normalized_color_val = 1
        else:
            normalized_color_val = 1 - (np.log(row["Confirmed"]) - min_confirmed)/np.log(max_confirmed)
        color_val = int(round(normalized_color_val*255))
        rgb_color_val = "rgb(255," + str(color_val) + "," + str(color_val) + ")"
        county_color_assignments[row["FIPS"]] = rgb_color_val
        #state assignmnet
        if len(str(row["FIPS"])) == 4 or len(str(row["FIPS"])) == 5:
            state_key = str(row["FIPS"])[:-3]

            if state_key not in state_color_assignments_aggregated:
                state_color_assignments_aggregated[state_key] = [row["Confirmed"]]
            else:
                tmp = state_color_assignments_aggregated[state_key]
                tmp.append(row["Confirmed"])
                state_color_assignments_aggregated[state_key] = tmp
    # print(state_color_assignments_aggregated)
    for key,value in state_color_assignments_aggregated.items():
        avg_confirmed = sum(value)/len(value)
        if avg_confirmed == 0:
            normalized_color_val = 1
        else:
            normalized_color_val = 1 - (np.log(avg_confirmed) - min_confirmed)/np.log(max_confirmed)
        color_val = int(round(normalized_color_val*255))
        rgb_color_val = "rgb(255," + str(color_val) + "," + str(color_val) + ")"
        state_color_assignments[key] = rgb_color_val



    return json.dumps(county_color_assignments), json.dumps(state_color_assignments)



def process_data():
    #Save corona data in DataFrame
    df = pd.read_csv("data/us_corona_counties.csv")
    df = df.drop("UID",axis=1).drop("iso2",axis=1).drop("iso3",axis=1).drop("code3",axis=1).drop("Country_Region",axis=1)
    #process county/state color data indexed by date
    #Only get the FIPS and Confirmed columns
    df = df[["FIPS", "Confirmed","Date"]]
    #drop all Nan values
    df= df.dropna(subset=["FIPS", "Confirmed","Date"])
    #cast FIPS as ints
    df["FIPS"] = pd.to_numeric(df["FIPS"], downcast="integer")
    #group duplicate territories (very few)
    df = df.groupby(["FIPS","Date"], as_index = False).agg("sum")
    #assert there are no duplicates
    assert not (df[["FIPS","Date"]].duplicated().any())
    #convert to json, where FIPS is key and Confirmed is value
    # df = df.set_index('FIPS')["Confirmed"].to_json()
    # print(df.loc[df['Date'] == "4/29/20"])
    max_confirmed = df["Confirmed"].max()

    state_colorings = {}
    county_colorings = {}

    #county confirmed cases overtime
    # print(df["Confirmed"].groupby(df["FIPS"]).unique())

    # print(df.groupby(["FIPS","Date"]))
    # return df

    list_of_dates = df["Date"].drop_duplicates()
    list_of_FIPS = df["FIPS"].drop_duplicates()
    county_colorings = []
    state_colorings = []
    county_graph = []
    state_graph = []
    pd.set_option("display.max_rows", None, "display.max_columns", None)

    FIPS_dict = {}
    for FIPS in list_of_FIPS:
        x = df.loc[df['FIPS'] == FIPS]
        y = x.iloc[pd.to_datetime(x["Date"]).values.argsort()]

        county_graph.append((FIPS,json.dumps(y["Confirmed"].to_list())))

        if len(str(FIPS)) == 4 or len(str(FIPS)) == 5:
            state_key = str(FIPS)[:-3]
            # print(state_key)
            if state_key not in FIPS_dict:
                # print([y["Confirmed"].to_list()])
                FIPS_dict[state_key] = [y["Confirmed"].to_list()]
            else:
                tmp = FIPS_dict[state_key]
                tmp.append(y["Confirmed"].to_list())
                # print(tmp)
                FIPS_dict[state_key] = tmp
    # print(type(FIPS_dict))
    for key,value in FIPS_dict.items():
        tmp = json.dumps(np.sum(value,0).tolist())
        state_graph.append((key,tmp))

    insert_data_into_tables(county_graph,"county_graph_data")
    insert_data_into_tables(state_graph,"state_graph_data")
    
    for date in list_of_dates:
        print(date)
        date_int = int(date.replace("/",""))
        filter_date_df = df.loc[df['Date'] == date]
        cc,ss = assign_color(filter_date_df,max_confirmed)
        county_colorings.append((date_int, cc))
        state_colorings.append((date_int, ss))
    insert_data_into_tables(county_colorings,"county_map_color_data")
    insert_data_into_tables(state_colorings,"state_map_color_data")
    # print(state_colorings)
    # print(county_colorings)

    # print(df)


    # x = df.loc[df['Date'] == list_of_dates[98]]
    # print(x)
    # y =  assign_color(x,max_confirmed)
    # print(y)
    # x["Confirmed"] = y
    # print(x)
    # x = x.replace(0,10000)
    # print(x)
    # print(x["Confirmed"])
    # print(assign_color(x["Confirmed"],max_confirmed))
    # x.loc[x["Confirmed"]]
    # print(x.where(x!=0, other=2))
    # print(assign_color(x, max_confirmed))
    


    # print(x.to_json())
    # print(x.apply(lambda y: assign_color(y,0,max_confirmed) if y.name == "Confirmed" else y))
    # x["Confirmed"] = x["Confirmed"].applymap(lambda y: assign_color(y,0,max_confirmed))
    # x["Confirmed"] = x["Confirmed"].apply(np.square)
    # for date in list_of_dates:
    #     FIPS_to_RGB = {}
    #     print(date)
    #     for i,r in df.loc[df['Date'] == date].iterrows():
    #         FIPS_to_RGB[r["FIPS"]] = assign_color(r["Confirmed"], max_confirmed, 0)
    #     county_colorings.append((date,json.dumps(FIPS_to_RGB)))
    #     # print(json.dumps(FIPS_to_RGB))

    # print(county_colorings)

    return df


if __name__ == '__main__':
    create_tables()
    # insert_data_into_tables(x)
    process_data()