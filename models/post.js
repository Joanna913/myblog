var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(id, title, cates,tags, post ) {
    this.id = id;
    this.title = title;
    this.cates = cates;
    this.tags = tags;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    var date = new Date();

    var time = {
        year : date.getFullYear(),
        month: date.getFullYear() + "/" + (date.getMonth() + 1),
        day: date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate(),
        minute: date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() +
        ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() )
    };
    var post = {
        id: this.id,
        time: time,
        title: this.title,
        cates: this.cates,
        tags: this.tags,
        post: this.post,
        comments: [],
        pv: 0,
        like: 0
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err, collection) {
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
Post.getAll = function (query, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
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
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
};
Post.getTen = function (name, page, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
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
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            });
        });
    });
};

Post.getOne = function (cates, tags, id, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "cates": cates,
                "tags": tags,
                "id": id
            }, {
                $inc: {"pv": 1}
            }, function (err) {
                //mongodb.close();         关闭mongodb
                if (err) {
                    callback(err);
                }
            });
            //根据发表日期和文章名进行查询
            collection.findOne({
                "cates": cates,
                "tags": tags,
                "id": id
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                if (doc) {
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                    callback(null, doc);
                }

            });
        });
    });
};

//根据类别查找所有
/*Post.getAllCates = function (cates, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if(cates) {
                query.cates = cates;
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
};*/

//根据类别查找10篇
Post.getTenByCate = function( cates, page, callback ) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(cates) {
                query.cates = cates;
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
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            });
        });
    });
};

//根据标签查找10篇
Post.getTenByTag = function (cates, tags, page, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection("posts", function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(cates) {
                query.cates = cates;
                query.tags = tags
            }
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
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            });
        });
    });
};
Post.getHot = function (name, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection("posts", function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name) {
                query.name = name;
            }
            collection.find(query, {
                limit: 6
            }).sort({
                pv: -1
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
Post.edit = function (cates, tags, id, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('posts', function (err, collection) {
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

//更新博客内容
Post.update = function (cates, tags, newTag, id, newtitle, post ,callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('posts', function (err, collection) {
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
                    "title": newtitle,
                    "tags": newTag,
                    "post": post
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

Post.updateHeart = function (cates, tags, title, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "cates": cates,
                "tags": tags,
                "title": title
            }, {
                $inc: {"like": 1}
            }, function (err, essay) {
                mongodb.close();
                if (err) {
                    callback(err);
                }
                callback(null, essay);
            });
        });
    });
};


Post.remove = function (cates, tags, id, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('posts', function (err, collection) {
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

Post.search = function (keyword,page, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err) ;
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var pattern = new RegExp(keyword, "i");
            collection.count({"title": pattern }, function (err, total) {
                collection.find({
                    "title": pattern
                }, {
                    "cates": 1,
                    "tags": 1,
                    "title": 1,
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

