var mongodb = require('./db');

function Message(name, email, message ) {
    this.name = name;
    this.email = email;
    this.message = message;
}
module.exports = Message;
Message.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        year : date.getFullYear(),
        month: date.getFullYear() + "/" + (date.getMonth() + 1),
        day: date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() +
        ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() )
    };
    var message = {
        "name": this.name,
        "email": this.email,
        "message": this.message,
        "time": time,
        "reply":""
    };
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('messages', function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(message, {
                safe: true
            }, function (err) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
Message.getAll = function (query, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('messages', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //根据query对象查文章
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                docs.forEach(function (doc) {
                    //doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
};
Message.getTen = function ( page, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('messages', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //根据query对象查文章
            collection.count({}, function (err, total) {
                collection.find({}, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null, docs, total);
                });
            });
        });
    });
};
Message.getFifty = function ( page, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('messages', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据query对象查文章
            collection.count({}, function (err, total) {
                collection.find({}, {
                    skip: (page - 1) * 50,
                    limit: 50
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null, docs, total);
                });
            });
        });
    });
};

Message.updateReply = function (minute,reply ,callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('messages', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "time.minute": minute
            }, {
                $set: {
                    "reply": reply
                }
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
Message.remove = function (minute, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('messages', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "time.minute": minute
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};