
import os
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from models import *

@app.route("/")
def hello():
    tmp = 12220
    try:
        statecol=StateColor.query.filter_by(id=tmp)
        countycol=CountyColor.query.all()
        stategraph = StateGraph.query.all()
        countygraph = CountyGraph.query.all()
        #print(jsonify([e.serialize() for e in statecol]))
        print(jsonify([e.serialize() for e in countycol]))
        # print(jsonify([e.serialize() for e in stategraph]))
        # print(jsonify([e.serialize() for e in countygraph]))
        return  jsonify([e.serialize() for e in statecol])
    except Exception as e:
        return(str(e))



if __name__ == '__main__':
    app.run()