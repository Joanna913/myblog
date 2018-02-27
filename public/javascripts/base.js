function globalInit() {
    $('.pri-grid').height(348);

    //nav && body
    var bodyHeight;
    var btnVertical = $('.btn-group-vertical');

    if($('.fex-navbar')[0]) {
        /*    fex-navbar有个marginTop代替pri_nav的高度    */
        // bodyHeight = $(window).height() - $('.fex-navbar').outerHeight(true) - $('footer').outerHeight(true);
        // $('.body-container').css({'min-height':bodyHeight});

        /* 滚动监听 */
        $(window).on('scroll',function() {
            btnVertical.show();
        });
    }


    //footer
    $('.glyphicon-education').on('click',function(){
        $('.login-container').toggle();
    });

    //edit
    var editHeight = $(window).height()  - $('.edit-content .form-inline').outerHeight(true) - $('footer').outerHeight(true);
    $('.edit-content textarea').outerHeight(editHeight);
}

function navFocus() {
    var navTabs = $('.nav.nav-tabs').find('li');
    var bodyManage = $('.body-manage > div');
    navTabs.on('click',function() {
        var index = $(this).index();
        if(index < 6) {
            navTabs.removeClass('active');
            $(this).addClass('active');
            bodyManage.hide();
            bodyManage.eq(index).show();
        }
    });

    var navCollapse = $('.navbar-collapse ul').find('li');
    var pathName = location.pathname;
    navCollapse.each(function(index, li) {
        var aLink = $(li).find('a')[0].pathname;
        if(pathName.search(aLink) == 0) {            //以alink开头
            $(this).addClass('active');              //获取aLink对应的Li元素
        }
    });
}

function dailyNavFocus() {
    var dailyNavItems = $('#daily-nav').find('.nav-items'),
        pagiItems = $('.pagination').find('.pagination-items'),
        dailyConItems = $('.daily-container').find('.daily-container-items');
    dailyNavItems.on('click',function(){
        var index = $(this).index();
        dailyNavItems.removeClass('selected');
        $(this).addClass('selected');
        pagiItems.hide();
        pagiItems.eq(index).show();
        dailyConItems.hide();
        dailyConItems.eq(index).show();
    });
}

function tagFocus() {
    var tagGroup = $('.tag-wal-body').find('.label');
    var pathName = location.pathname;
    tagGroup.each(function (index, span) {
        var aLink = $(span).find('a')[0].pathname;
        // console.log(pathName, aLink);
        if(pathName.search(aLink) == 0) {            //以alink开头
            $(this).addClass('active');              //获取aLink对应的Li元素
        }
    })

}

function tagOptionChange () {
    // 博客编辑页面
    var editCates = $('.blog-edit-cates-group');
    var editTags = $('.blog-edit-tags-group');   //DOM对象
    if(editCates[0]) {
        var tagOptions = new TagOptions(editCates[0],editCates.val(),editTags[0]);
        tagOptions.editInit();
        editCates.on('change',function () {
            var cate = $(this).val();
            tagOptions = new TagOptions(this,cate,editTags[0]);
            tagOptions.editInit();
        });
    }

    // 博客管理界面
    var manCates = $('.blog-manage-cates-group');
    var manTags = $('.blog-manage-tags-group');
    if(manCates[0]) {
        var tagOptions = new TagOptions(manCates[0],manCates.val(),manTags[0]);
        tagOptions.manageInit();
        manCates.on('change',function () {
            var cate = $(this).val();
            tagOptions = new TagOptions(this,cate,manTags[0]);
            tagOptions.manageInit();
        });
        manTags.on('change',function () {
            tagOptions.getPostsByTag(manTags.val());
        });
    }
}



function TagOptions(container, cate, tagsGroup) {
    this.container = container;
    this.cate = cate;
    this.tags = [];
    this.tagsGroup = tagsGroup;
    this.tag = null;
}
TagOptions.prototype = {
    editInit: function () {
        var self = this;
        $.ajax({
            type: 'POST',
            url:'/myfex/blog_edit/' + this.cate ,
            dataType: "json",
            error: function (err) {
                console.log('err',this.url);
            },
            success: function (doc) {
                self.tags = doc[0].tags;
                self.appendOptions();
            }
        });
    },
    manageInit: function () {
        var self = this;
        $.ajax({
            type: 'POST',
            url:'/myfex/manage/' + self.cate,
            dataType: "json",
            error: function (err) {
                console.log('err',self.url);
            },
            success: function (doc) {
                self.tags = doc.length && doc[0].tags || [];
                self.appendOptions();
                self.tag = $(self.tagsGroup).val();
                self.getPostsByTag(self.tag);
            }
        });
    },
    getPostsByTag: function (tag) {
        var self = this;
        $.ajax({
            type: 'POST',
            url:'/myfex/manage/' + self.cate + '/' + tag,
            dataType: "json",
            error: function (err) {
                console.log('err',self.url);
            },
            success: function (docs) {
                // console.log(docs);
                self.appendBlogLists(docs);
            }
        });
    },
    appendOptions: function () {
        var self = this;
        $(this.tagsGroup).empty();
        this.tags.forEach(function (tag) {
            $(self.tagsGroup).append("<option>" + tag + "</option>");
        });
    },
    appendBlogLists: function (docs) {
        var self = this;
        var blogLists = $('.blog-manage table').find('tbody');
        blogLists.empty();
        docs.forEach(function (doc) {
            var list = "";
            list += "<tr><td><a href='/myfex/blogs/" + doc.cates + "/" + doc.tags + "/" + doc.id +"'>" + doc.title + "</a></td><td>";
            list += doc.cates + "</td><td>" + doc.tags + "</td><td>" + doc.time.minute + "</td><td>" + doc.pv +"</td><td>" + doc.comments.length +"</td>";
            list += "<td><a href='/myfex/blog_edit/" + doc.cates + "/" + doc.tags + "/" + doc.id + "'>";
            list += "<i class='glyphicon glyphicon-pencil'></i></a>";
            list += "<a href='/myfex/blog_remove/" + doc.cates + "/" + doc.tags + "/" + doc.id + "'>";
            list += "<i class='glyphicon glyphicon-trash'></i></a>";
            list += "</td></tr>";
            blogLists.append(list);
        })

    }
};