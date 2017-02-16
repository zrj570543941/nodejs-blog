/**
 * Created by Administrator on 2017/2/4.
 */
const per_page_comment_count = 2;
var cur_page_num = 1, //当前评论所在分页页码
    whole_paginal_num = 1, //评论分页总页数
    comments = []; 

function getQueryStringArgs(){

    //get query string without the initial ?
    var qs = (location.search.length > 0 ? location.search.substring(1) : ""),

        //object to hold data
        args = {},

        //get individual items
        items = qs.length ? qs.split("&") : [],
        item = null,
        name = null,
        value = null,

        //used in for loop
        i = 0,
        len = items.length;

    //assign each item onto the args object
    for (i=0; i < len; i++){
        item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);

        if (name.length){
            args[name] = value;
        }
    }

    return args;
}

/**
 *作用是在内容详情页上展示相关评论，并且是分页展示，每页只展示所在页码的那些评论
 * @param comments：该内容页所有评论所组成的数组
 */
function renderComment() {
    var html = '';
    var lis = $('.pager li');
    //当前页面无评论时
    if (comments.length === 0) {
        $('.messageList').html('<div class="messageBox"><p>还没有留言</p></div>');
        return;
    }

    //计算分页页码总数
    whole_paginal_num = Math.ceil( comments.length / per_page_comment_count);
    
    //下面两步确定了每个分页所要展示的评论的区间[per_page_comment_start_pos, per_page_comment_end_pos)
    var per_page_comment_start_pos = Math.max(0, (cur_page_num - 1) * per_page_comment_count, 0);
    var per_page_comment_end_pos = Math.min(whole_paginal_num, per_page_comment_start_pos + per_page_comment_count );
    //两个if来判断是否显示上一页（下一页）连接
    if (cur_page_num <= 1) {
        $('.previous').html('<span>没有上一页了</span>');
    } else {
        $('.previous').html('<a href="javascript:;">上一页</a>');
    }
    if (cur_page_num >= whole_paginal_num) {
        $('.next').html('<span>没有下一页了</span>');
    } else {
        $('.next').html('<a href="javascript:;">下一页</a>');
    } 
    //当前所在分页的显示
    $('.cur-page-sign').html(cur_page_num + '/' + whole_paginal_num);
    $('#messageCount').html(comments.length);
    for (var i = per_page_comment_start_pos; i < per_page_comment_end_pos; i++) {
        html += '<div class="messageBox">' +
                    '<p class="name clear"><span class="fl">' + comments[i].username + '</span>' +
                        '<span class="fr">' + formatDate(comments[i].commentTime) + '</span>'+
                    '</p>'+
                    '<p>'+ comments[i].comment_content + '</p>'+
                '</div>';
    }
    $('.messageList').html(html);
}

function formatDate(date) {
    var date1 = new Date(date);
    return date1.getFullYear() + '年'
        + (date1.getMonth()+1) + '月'
        + date1.getDate() + '日 '
        + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds();
}
$(function () {
    /**
     * 点击提交按钮时向后台传评论并且显示在前端页面
     */
   $('#messageBtn').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/comment/post',
            data: {
                content_id : getQueryStringArgs().content_id,
                comment_content : $('#messageContent').val()
            },
            success : function (data) {
                $('#messageContent').val('');
                //调用reverse是为了让最新评论显示在最前面
                comments = data.content.comments.reverse();
                cur_page_num = 1;
                renderComment();
            }
        });
   });
   //计算当前评论所在分页页码并重新展示评论
   $('.pager').on('click', 'a', function(event) {
        if ($(this).parent().hasClass('previous')) {
            cur_page_num--;
            renderComment();
        } else {
            cur_page_num++;
            renderComment();
        }
   });
});

//每次页面重载的时候获取并显示该文章的所有评论到页面中
$.ajax({
    url: '/api/comment',
    data: {
        content_id: getQueryStringArgs().content_id
    },
    success: function(responseData) {
        comments =responseData.data.reverse();
        renderComment();
    }
});
