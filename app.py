from flask import Flask, render_template, request, jsonify, send_from_directory
import random,os, json,sys
import pandas as pd 
import random,os,json,sys
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
app.config['TEMPLATES_AUTO_RELOAD'] = True
from models import *
app = Flask(__name__,template_folder='templates', static_url_path='/static') 

@app.route("/") 
def index(): 
    print(app.root_path)
    print(os.path.join(app.root_path, 'static'))
    print("............................")
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),'favicon.ico')

# @app.route("/")
# def hello():
#     tmp = 12220
#     try:
#         statecol=StateColor.query.filter_by(id=tmp)
#         countycol=CountyColor.query.all()
#         stategraph = StateGraph.query.all()
#         countygraph = CountyGraph.query.all()
#         print(jsonify([e.serialize() for e in statecol]))
#         print(jsonify([e.serialize() for e in countycol]))
#         print(jsonify([e.serialize() for e in stategraph]))
#         print(jsonify([e.serialize() for e in countygraph]))
#         return  jsonify([e.serialize() for e in statecol])
#     except Exception as e:
#         return(str(e))



if __name__ == '__main__':
    app.run()







# @app.route('/usjson')
# def usjson():
#     # app.send_static_file('countries')
#     data = send_from_directory(os.path.join(app.root_path, 'static'),'counties-10m.json')
#     # print(x)
#     # response = app.response_class(
#     #     response=json.dumps(data),
#     #     status=200,
#     #     mimetype='application/json'
#     # )
#     # print(response)
#     # print(str(x))
#     # print(jsonify([e.serialize() for e in x]))
#     # return data
#     #print(x)