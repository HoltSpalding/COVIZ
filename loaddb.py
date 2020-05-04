#!/usr/bin/python
import json
import psycopg2
from loaddb_config import config

def create_tables():
    """ create tables in the PostgreSQL database"""
    commands = (
        """
        CREATE TABLE map_color_data (
            dateid INTEGER NOT NULL PRIMARY KEY,
            info json NOT NULL
        )
        """,
        """ CREATE TABLE state_graph_data (
                state_id INTEGER PRIMARY KEY,
                info json NOT NULL
                )
        """,
        """ CREATE TABLE county_graph_data (
                county_id INTEGER PRIMARY KEY,
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


def insert_data_into_tables(data_list):
    """ insert multiple vendors into the vendors table  """
    sql = "INSERT INTO map_color_data (dateid, info) VALUES (%s,%s)"
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


def process_data():
    return 0

if __name__ == '__main__':
    create_tables()
    date1 = 12
    date1json = json.dumps({"a":"b","b":"c"})
    date2 = 66
    date2json = json.dumps({"t":"z","q":"g"})
    x = [(date1,date1json),(date2,date2json)]
    insert_data_into_tables(x)