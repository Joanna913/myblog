var mongodb = require('./db');
function Category(cate, tag ) {
    this.tag = tag;
    this.cate = cate;
}
module.exports = Category;

Category.prototype.save = function (callback){
    var newTag = this.tag,
        cate = this.cate;

    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        //读取posts集合
        db.collection('category', function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.update({
                "cate": cate
            }, {
                $push: {"tags": newTag}
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

//注：返回的是数组
Category.getCate = function (cate, callback) {
    mongodb.open(function (err, db) {
        if(err) {
            mongodb.close();
            return callback(err);
        }

        db.collection('category', function (err, colleciton) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(cate) {
                query.cate = cate;
            }
            colleciton.find(query).toArray(function (err, cates) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null, cates);
            });
        });
    });
};