var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
}

module.exports = User;

User.prototype.save = function (callback) {
    var user = {
        name : this.name,
        email : this.email,
        password : this.password
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if(err) {
            return callback(err);
        }
        //读取用户信息
        db.collection('users', function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //将用户数据插入users集合
            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null, user[0]);
            });
        });
    });
};

//读取用户信息
User.get = function (name, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //查找用户名
            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null, user);
            });
        });
    });
};
