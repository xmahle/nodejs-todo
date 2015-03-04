var express = require('express');
var _ = require('underscore');
var app = express();
var server = require('http').createServer(app);
var config = require('./lib/config');
var secret = require('./lib/secret');

var MongoClient = require('mongodb').MongoClient
    , ObjectID = require('mongodb').ObjectID;

var collection = null;

MongoClient.connect(secret.mongoDBconnection, function (err, db) {
    if (err) {
        throw err;
    } else {
        collection = db.collection('todos');

    }
    //db.close();
});

app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use('/public', express.static('public'));

app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: guid()}));

app.use(app.router);

//helper method for writing out json payloads
var json = function(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

  if(typeof data === "string") res.write(data);

  else res.write(JSON.stringify(data));

  res.end();
};

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/todos', function(req, res) {
    collection.find().toArray(function(err, data) {
    json(res, data);
  });

});

app.post('/todos/create', function(req, res) {

    collection.insert({description:req.body.description},{}, function(err, docs) {
        json(res, { id: docs._id });
    });

});

app.post('/todos/update', function(req, res) {
    collection.update({_id:ObjectID(req.body.id)}, {$set:{description:req.body.description}});

  json(res, { });
});

app.post('/todos/delete', function(req, res) {
    collection.remove({_id:ObjectID(req.body.id)}, function(err, result) {
        if(err)
            console.log(err);
        json(res, result);
    });
});

server.listen(process.env.PORT || config.port);
