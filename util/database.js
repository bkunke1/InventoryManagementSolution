const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://nodeUser:dUbgzK1wfxJfHzUI@cluster0-5kdcc.mongodb.net/<dbname>?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('Connected to mongoDB!');
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;