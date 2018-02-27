var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js'),
    Draft = require('../models/draft.js'),
    Message = require('../models/message.js'),
    Category = require('../models/category.js'),
    Dairy = require('../models/dairy.js');



module.exports = function(app) {
    app.get('/', function (req, res) {
        res.render('homepage', {
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });

    });

    app.get('/daily', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Dairy.getTen(null, page, function (err, dairies, total) {
            if (err) {
                dairies = [];
            }
            Message.getTen(page,function(err, messages, mesTotal ) {
                if (err) {
                    messages = [];
                }
                res.render('daily', {
                    cates: req.params.cates || null,
                    user: req.session.user,
                    dairies: dairies,
                    messages: messages,
                    page: page,
                    mesPage:page,
                    totalPage: Math.ceil(total / 10),
                    totalMesPage: Math.ceil(mesTotal / 10),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + dairies.length) == total,
                    isFirstMesPage:(page - 1) == 0,
                    isLastMesPage: ((page - 1) * 10 + messages.length) == mesTotal,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });

        });
    });
    app.post('/daily', checkLogin);
    app.post('/daily',function (req, res) {
        var dairy = new Dairy(req.body.content);
        dairy.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('back');
        });
    });

    app.post('/daily/message',function (req, res) {
        var message = new Message(req.body.name, req.body.email, req.body.message);
        message.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('back');
        });
    });


    app.get('/myfex/manage',checkLogin);
    app.get('/myfex/manage', function (req, res) {
        Post.getAll(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            Draft.getAll(null, function (err, drafts) {
                if (err) {
                    drafts = [];
                }
                Dairy.getAll(null, function (err, dairies) {
                    if (err) {
                        dairies = [];
                    }
                    Message.getAll(null, function(err, messages){
                        if (err) {
                            messages = [];
                        }
                        Category.getCate(null, function(err, cates){
                            if (err) {
                                cates = [];
                            }
                            res.render('fexManage', {
                                user: req.session.user,
                                posts: posts,
                                drafts: drafts,
                                dairies: dairies,
                                messages: messages,
                                cates: cates,
                                success: req.flash('success').toString(),
                                error: req.flash('error').toString()
                            });
                        });
                    });
                });
            });
        });
    });

    app.post('/myfex/manage/:cates',checkLogin);
    app.post('/myfex/manage/:cates', function(req,res) {
        Category.getCate(req.params.cates, function(err, cates) {
            if(err) {
                cates = [];
            }
            res.send(cates);
        });
    });

    app.post('/myfex/manage/:cates/:tags',checkLogin);
    app.post('/myfex/manage/:cates/:tags', function(req,res) {
        var query = {
            cates: req.params.cates,
            tags: req.params.tags
        };
        Post.getAll(query, function(err, docs) {
            if (err) {
                docs = []
            }
            res.send(docs);
        })
    });

    app.get('/myfex/search', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Post.getHot(null, function (err, hotPosts) {
            if (err) {
                hotPosts = [];
            }
            Post.search(req.query.keyword, page, function (err, posts, total) {
                if(err) {
                    req.flash('error');
                    return res.redirect('/');
                }
                res.render('myfex', {
                    cates: req.params.cates || null,
                    user: req.session.user,
                    posts: posts,
                    page: page,
                    hotPosts: hotPosts,
                    totalPage: Math.ceil(total / 10),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });

    app.get('/myfex/blog_edit',checkLogin);
    app.get('/myfex/blog_edit', function (req, res) {
        Category.getCate(null, function(err,cates) {
            if(err) {
                cates = [];
            }
            res.render('blogEdit', {
                draft: null,
                post: null,
                cates: cates,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });

    });

    app.post('/myfex/blog_edit',checkLogin);
    app.post('/myfex/blog_edit', function(req,res) {
        var currentUser = req.session.user,
            post_id = crypto.createHash('md5').update(req.body.title).digest('hex'),
            post = new Post(post_id, req.body.title, req.body.cates, req.body.tags, req.body.post );
        post.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/myfex/blog_edit');
            }
            req.flash('success','发布成功！');
            res.redirect('/myfex/manage');
        })
    });

    //修改cates标签
    app.post('/myfex/blog_edit/:cates',checkLogin);
    app.post('/myfex/blog_edit/:cates', function(req,res) {
        Category.getCate(req.params.cates, function(err, cates) {
            if(err) {
                cates = [];
            }
            res.send(cates);
        });
    });


    app.get('/myfex/blog_edit/:cates/:tags/:id', checkLogin);
    app.get('/myfex/blog_edit/:cates/:tags/:id', function (req, res) {
        Post.edit(req.params.cates, req.params.tags , req.params.id, function (err, post) {
            if(err) {
                req.flash('error',err);
                return res.redirect('back')
            }
            res.render('blogEdit', {
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/myfex/blog_edit/:cates/:tags/:id', checkLogin);
    app.post('/myfex/blog_edit/:cates/:tags/:id', function (req, res) {
        Post.update(req.params.cates, req.params.tags, req.body.tags, req.params.id, req.body.title, req.body.post, function (err) {
            if(err) {
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','修改成功！');
            res.redirect('/myfex/manage')
        });
    });

    app.get('/myfex/blog_remove/:cates/:tags/:id', checkLogin);
    app.get('/myfex/blog_remove/:cates/:tags/:id', function (req, res) {
        Post.remove(req.params.cates, req.params.tags, req.params.id, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('/myfex/manage');
        })
    });


    app.post('/myfex/post_to_draft/:id', checkLogin);
    app.post('/myfex/post_to_draft/:id', function (req, res) {
        var post_id = crypto.createHash('md5').update(req.body.title).digest('hex'),
            draft = new Draft(post_id, req.body.title, req.body.cates, req.body.tags, req.body.post );
        //删除已发表博客，将其置换为草稿

        Post.remove(req.body.cates, req.body.tags, req.params.id, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            draft.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/myfex/blog_edit');
                }
                req.flash('success','发布成功！');
                res.redirect('/myfex/manage');
            });
        });
    });

    app.post('/myfex/draft_edit', checkLogin);
    app.post('/myfex/draft_edit', function (req, res) {
        var post_id = crypto.createHash('md5').update(req.body.title).digest('hex'),
            draft = new Draft(post_id, req.body.title, req.body.cates, req.body.tags, req.body.post );

        draft.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/myfex/blog_edit');
            }
            req.flash('success','发布成功！');
            res.redirect('/myfex/manage');
        });
    });
    app.get('/myfex/draft_edit/:cates/:tags/:id', checkLogin);
    app.get('/myfex/draft_edit/:cates/:tags/:id', function (req, res) {
        Draft.edit(req.params.cates, req.params.tags , req.params.id, function (err, draft) {
            if(err) {
                req.flash('error',err);
                return res.redirect('back')
            }
            res.render('draftsEdit', {
                draft: draft,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    //将草稿发表成博客
    app.post('/myfex/draft_edit/:cates/:tags/:id', checkLogin);
    app.post('/myfex/draft_edit/:cates/:tags/:id', function (req, res) {
        var currentUser = req.session.user,
            post_id = crypto.createHash('md5').update(req.body.title).digest('hex'),
            post = new Post(post_id, req.body.title, req.body.cates, req.body.tags, req.body.post );

        //删除原来的草稿
        Draft.remove(req.params.cates, req.params.tags, req.params.id, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            post.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/myfex/blog_edit');
                }
                req.flash('success','发布成功！');
                res.redirect('/myfex/manage');
            });
        });
    });

    //保存编辑的草稿
    app.post('/myfex/draft_update/:cates/:tags/:id', checkLogin);
    app.post('/myfex/draft_update/:cates/:tags/:id', function (req, res) {
        Draft.update(req.params.cates, req.params.tags , req.body.tags , req.params.id, req.body.title, req.body.post, function (err) {
            if(err) {
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','修改成功！');
            res.redirect('/myfex/manage')
        });
    });

    app.get('/myfex/draft_remove/:cates/:tags/:id', checkLogin);
    app.get('/myfex/draft_remove/:cates/:tags/:id', function (req, res) {
        Draft.remove(req.params.cates, req.params.tags, req.params.id, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('/myfex/manage');
        });
    });

    app.post('/myfex/tag_add/:cate/:newTag/', checkLogin);
    app.post('/myfex/tag_add/:cate/:newTag/', function (req, res) {
        var category = new Category(req.params.cate, req.params.newTag);
        category.save(function (err) {
            if(err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            Category.getCate(req.params.cate, function (err, cate) {
                if(err) {
                    req.flash('error', err);
                    return res.redirect('back');
                }
                res.send(cate);
            });
        });
    });

    app.post('/myfex/file_upload', checkLogin);
    app.post('/myfex/file_upload', function (req, res) {
        res.redirect('back');
    });
    app.get('/myfex/dairy_remove/:minute', checkLogin);
    app.get('/myfex/dairy_remove/:minute', function (req, res) {
        Dairy.remove(req.params.minute, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('back');
        });
    });

    app.get('/myfex/message_remove/:minute', checkLogin);
    app.get('/myfex/message_remove/:minute', function (req, res) {
        Message.remove(req.params.minute, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('back');
        });
    });
    app.post('/myfex/message_reply/:minute', checkLogin);
    app.post('/myfex/message_reply/:minute', function (req, res) {
        Message.updateReply(req.params.minute,req.body.reply, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success','发布成功！');
            res.redirect('back');
        });
    });

    app.get('/myfex/blogs/all', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Post.getHot(null, function (err, hotPosts) {
            if (err) {
                hotPosts = [];
            }
            Post.getTen(null, page, function (err, posts, total) {
                if (err) {
                    posts = [];
                }
                res.render('myfex', {
                    cates: req.params.cates || null,
                    user: req.session.user,
                    posts: posts,
                    hotPosts: hotPosts,
                    page: page,
                    totalPage: Math.ceil(total / 10),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });

    app.get('/myfex/blogs/:cates', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Category.getCate(req.params.cates, function (err, cate) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            Post.getHot(null, function (err, hotPosts) {
                if (err) {
                    hotPosts = [];
                }
                Post.getTenByCate(req.params.cates, page, function (err, tenPosts, total) {
                    if (err) {
                        tenPosts = [];
                    }
                    res.render('myfex', {
                        cates: req.params.cates || null,
                        user: req.session.user,
                        posts: tenPosts,
                        page: page,
                        hotPosts: hotPosts,
                        tags: cate.length && cate[0].tags,
                        totalPage: Math.ceil(total / 10),
                        isFirstPage: (page - 1) == 0,
                        isLastPage: ((page - 1) * 10 + tenPosts.length) == total,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                });
            });
        });
    });
    app.get('/myfex/blogs/:cates/:tags', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Category.getCate(req.params.cates, function (err, cate) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            Post.getHot(null, function (err, hotPosts) {
                if (err) {
                    hotPosts = [];
                }
                Post.getTenByTag(req.params.cates, req.params.tags, page, function (err, tenPosts, total) {
                    if (err) {
                        tenPosts = [];
                    }
                    res.render('myfex', {
                        cates: req.params.cates || null,
                        user: req.session.user,
                        posts: tenPosts,
                        tags: cate[0].tags,
                        page: page,
                        hotPosts: hotPosts,
                        totalPage: Math.ceil(total / 10),
                        isFirstPage: (page - 1) == 0,
                        isLastPage: ((page - 1) * 10 + tenPosts.length) == total,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                });
            });
        });
    });

    app.get('/myfex/blogs/:cates/:tags/:id', function (req, res) {
        Category.getCate(req.params.cates, function (err, cate) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            Post.getOne(req.params.cates, req.params.tags , req.params.id, function (err, post) {
                if(err) {
                    req.flash('error',err);
                    return res.redirect('back')
                }
                res.render('essay', {
                    cates: req.params.cates || null,
                    post: post,
                    tags: cate[0].tags,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
    app.post('/myfex/blogs/:cates/:tags/:id', function (req, res){
       /* Post.updateHeart(req.params.cates, req.params.tags, req.params.id, function(err, essay) {
            if(err) {
                return res.redirect('back');
            }
            console.log(essay)
        });*/
    });

    app.get('/myfex/blogs/:cates/:tags/:id/debugtool', function (req, res) {
        res.render('debugTool.ejs');
    });
    app.post('/myfex/blogs/:cates/:tags/:id/newComment', function (req, res){
        var date = new Date(),
            time = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() +
                ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() );
        var comment = {
            name: req.body.name,
            email: req.body.email,
            time: time,
            content: req.body.content,
            target: req.body.target
        };
        var newComment = new Comment(req.params.cates, req.params.tags, req.params.id, comment);
        newComment.save(function (err) {
            if(err) {
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','留言成功');
            res.redirect('back');
        });
    });

    app.post('/login',function (req, res) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name, function (err, user) {
            if(!user) {
                req.flash('error','用户不存在');
                return res.redirect('back')
            }

            if(user.password != password) {
                req.flash('error', '密码错误！');
                return res.redirect('back')
            }

            req.session.user = user;
            req.flash('success','登录成功！');
            res.redirect('back');
        });
    });

    app.get('/logout',checkLogin);
    app.get('/logout',function (req, res) {
        req.session.user = null;
        res.redirect('/');
    });
    app.get('/yukiReg', function (req, res) {
        res.render('reg', {
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/yukiReg', function (req, res) {
        console.log('req.body',req.body);
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];

        if(password_re != password) {
            req.flash('error', '两次密码输入不一致');
            return res.redirect('/yukiReg');
        }

        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');

        var newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
        });

        User.get(newUser.name, function (err, user) {
            if(err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            if(user) {
                req.flash('error','用户已存在');
                return res.redirect('/yukiReg');
            }
            newUser.save(function (err, user) {
                if(err) {
                    req.flash('error',err);
                    return res.redirect('/yukiReg');
                }
                req.session.user = user;
                console.log(req.session.user);
                req.flash('success','注册成功！');
                res.redirect('/');
            });
        });
    });

    app.use(function(req, res) {
        res.render('404');
    });
    function checkLogin(req,res,next) {
        if(!req.session.user) {
            req.flash('error', '无权限!');
            res.redirect('/');
        }

        next();
    }
    function checkNotLogin(req,res,next) {
        if(req.session.user) {
            req.flash('error', '已登录！');
            res.redirect('back');
        }
        next();
    }

};
