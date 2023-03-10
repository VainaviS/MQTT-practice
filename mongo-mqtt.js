var mongodb  = require('mongodb');
var mqtt     = require('mqtt');
var config   = require('./config');

var mqttUri  = 'mqtt://' + config.mqtt.user + ':' + config.mqtt.password + '@' + config.mqtt.hostname + ':' + config.mqtt.port;
//mongodb+srv://Vainavi:<password>@cluster0.g1rbwlg.mongodb.net/?retryWrites=true&w=majority
var client   = mqtt.connect(mqttUri);

client.on('connect', function () {
    client.subscribe(config.mqtt.namespace);
});

var mongoUri = 'mongodb://' + config.mongodb.hostname + ':' + config.mongodb.port + '/' + config.mongodb.database;
//mongodb+srv://Vainavi:<password>@cluster0.g1rbwlg.mongodb.net/?retryWrites=true&w=majority
mongodb.MongoClient.connect(mongoUri, function(error, database) {
    if(error != null) {
        throw error;
    }

    var collection = database.collection(config.mongodb.collection);
    collection.createIndex( { "topic" : 1 } );

    client.on('message', function (topic, message) {
        var messageObject = {
            topic: topic,
            message: message.toString()
        };

        collection.insert(messageObject, function(error, result) {
            if(error != null) {
                console.log("ERROR: " + error);
            }
        });
    });
});