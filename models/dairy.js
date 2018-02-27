var mongodb = require('./db');

function Dairy( post ) {
    this.post = post;
}

module.exports = Dairy;

Dairy.prototype.save = function (callback) {
    var date = new Date();

    var time = {
        year : date.getFullYear(),
        month: date.getFullYear() + "/" + (date.getMonth() + 1),
        day: date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() +
        ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() )
    };
    var post = {
        time: time,
        post: this.post
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('dairy', function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(post, {
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

Dairy.getTen = function (name, page, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('dairy', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if(name) {
                query.name = name;
            }
            //根据query对象查文章
            collection.count(query, function (err, total) {
                collection.find(query, {
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
Dairy.getFifty = function (name, page, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('dairy', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if(name) {
                query.name = name;
            }
            //根据query对象查文章
            collection.count(query, function (err, total) {
                collection.find(query, {
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
Dairy.getAll = function (query, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('dairy', function (err, collection) {
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
Dairy.remove = function (minute, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('dairy', function (err, collection) {
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