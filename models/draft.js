var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Draft(id, title, cates,tags, post ) {
    this.id = id;
    this.title = title;
    this.cates = cates;
    this.tags = tags;
    this.post = post;
}

module.exports = Draft;

Draft.prototype.save = function (callback) {
    var date = new Date();

    var time = {
        year : date.getFullYear(),
        month: date.getFullYear() + "/" + (date.getMonth() + 1),
        day: date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(),
        minute: date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() +
        ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() )
    };
    var draft = {
        id: this.id,
        time: time,
        title: this.title,
        cates: this.cates,
        tags: this.tags,
        post: this.post
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('drafts', function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(draft, {
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

//读取用户信息
Draft.getAll = function (name, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('drafts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if(name) {
                query.name = name;
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
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
};


Draft.edit = function (cates, tags, id, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('drafts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "cates": cates,
                "tags": tags,
                "id": id
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);
            });
        });
    });
};

Draft.update = function (cates, tags, newTag, id, newtitle, post ,callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('drafts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "cates": cates,
                "tags": tags,
                "id": id
            }, {
                $set: {
                    title: newtitle,
                    tags: newTag,
                    post: post
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

Draft.remove = function (cates, tags, id, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('drafts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "cates": cates,
                "tags": tags,
                "id": id
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
