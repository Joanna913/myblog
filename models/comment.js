var mongodb = require('./db');

function Comment( cates, tags, id, comment ) {
    this.id = id;
    this.cates = cates;
    this.tags = tags;
    this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function (callback) {
    var id = this.id,
        cates = this.cates,
        tags = this.tags,
        comment = this.comment;
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
            collection.update({
                "cates": cates,
                "tags": tags,
                "id": id
            }, {
                $push: {"comments": comment}
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
Comment.remove = function (callback) {

}