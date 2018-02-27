/**
 * Created by yuki on 15/12/6.
 */

$(function(){
    globalInit();
    navFocus();
    tagFocus();
    dailyNavFocus();
    tagOptionChange();

    //新增标签
    var newTagBtn = $('.tag-manage').find('.glyphicon-plus');
    newTagBtn.on('click', function () {
        var cateInfoId = $(this).parents('.cate-info')[0].id;
        var cateName = $('#'+ cateInfoId).find('.cate-name').html(),
            tagsList =$('#'+ cateInfoId).find('.tags-list');
        var newTag = $(this).parent().find("input[name='newTag']").val();
        if(newTag) {
            $.ajax({
                type: 'POST',
                url: '/myfex/tag_add/' + cateName + '/' + newTag,
                date: 'json',
                success: function (doc) {
                    console.log(doc);
                    tagsList.empty();
                    doc[0].tags.forEach(function(tag) {
                        tagsList.append('<span class="label label-info">' + tag + '</span>');
                    });
                },
                error: function (err) {
                    console.log('err!');
                }
            });
        }
    });



    // comment target
    var comTarget = $('.comment-target'),
        comForm = $('.comment-form');
    comTarget.on('click', function() {
        var target = $(this).parent().siblings('.commentator').html();
        comForm[0].scrollIntoView();
        comForm.find('input[name="target"]').val(target);
    });

    // btn group
    var searchBtn = $('.glyphicon-search'),
        toTopBtn = $('.glyphicon-triangle-top'),
        messageBtn = $('.glyphicon-send');
    var searchInput = $('#navbar-search');
    messageBtn.on('click', function () {
        if(window.location.href.search("/daily") == -1) {
            window.open("/daily","_self");
        }
    });
    toTopBtn.on('click', function() {
        $('body').animate({scrollTop: '0px'}, 400);
    });
    searchBtn.on('click', function () {
        window.open('/myfex/search?keyword=' + searchInput.val())
    });

    //message replay
    var replayBtn = $('.message-replay');
    replayBtn.on('click', function () {
        $('.reply-form').toggle();
    })


});


