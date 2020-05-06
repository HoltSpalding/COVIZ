from app import db

# class Book(db.Model):
#     __tablename__ = 'books'

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String())
#     author = db.Column(db.String())
#     published = db.Column(db.String())

#     def __init__(self, name, author, published):
#         self.name = name
#         self.author = author
#         self.published = published

#     def __repr__(self):
#         return '<id {}>'.format(self.id)
    
#     def serialize(self):
#         return {
#             'id': self.id, 
#             'name': self.name,
#             'author': self.author,
#             'published':self.published
#         }


class StateColor(db.Model):
    __tablename__ = 'state_map_color_data'
    id = db.Column(db.Integer, primary_key=True)
    info = db.Column('info',db.JSON) 

    def __init__(self, info):
        self.info = info
    
    def serialize(self):
        return {
            'id': self.id, 
            'info': self.info
        }  

class CountyColor(db.Model):
    __tablename__ = 'county_map_color_data'
    id = db.Column(db.Integer, primary_key=True)
    info = db.Column('info',db.JSON) 

    def __init__(self, info):
        self.info = info
    
    def serialize(self):
        return {
            'id': self.id, 
            'info': self.info
        }  

class StateGraph(db.Model):
    __tablename__ = 'state_graph_data'
    id = db.Column(db.Integer, primary_key=True)
    info = db.Column('info',db.JSON) 

    def __init__(self, info):
        self.info = info
    
    def serialize(self):
        return {
            'id': self.id, 
            'info': self.info
        }  

class CountyGraph(db.Model):
    __tablename__ = 'county_graph_data'
    id = db.Column(db.Integer, primary_key=True)
    info = db.Column('info',db.JSON) 

    def __init__(self, info):
        self.info = info
    
    def serialize(self):
        return {
            'id': self.id, 
            'info': self.info
        }  