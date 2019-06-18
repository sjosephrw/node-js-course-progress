const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://joseph:MGL12039487abcde@nodejsproject-wqkqi.mongodb.net/shop?retryWrites=true&w=majority', {useNewUrlParser: true })
    .then(client => {
        //callback(client); //this is not efficient so use below
        _db = client.db();//the database name is specified as shop in the db connection URL
        //_db = client.db('new_database');//to connect to another db than the one specified as shop in the db connection URL
        console.log('Connected.')
        callback();
    }).catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if(_db){//if the connection is established
        return _db;
    } else {
        throw 'No database found!';
    }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;