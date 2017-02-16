/**
 * Created by Administrator on 2017/1/27.
 */

const express = require('express'),
    categoryModel = require('../models/category.js'),
    contentModel = require('../models/content.js'),
    userModel = require('../models/user.js'),
    router = express.Router();
// 初始化将要传给首页或内容详情页模板的对象
let data = {};
// 前台各页面通用数据的获取,包括userInfo，categories
router.use(function (req, res, next) {

    data.userInfo = req.userInfo;

    // 分类列表的获取
    categoryModel.find().then(function (category_lists) {
        data.categories = category_lists;
        next();
    });
});
/**前台首页的展示
 * 根据当前页面网址中query string中的category的值判断是否在首页还是分类页
 *                                   page_num判断当前分页页码
 * 传给前台首页展示的data形式如下
 * data = {
    userInfo : {},
    categories: [], //category doc的数组集合
    cur_category: '', //当前页面的分类的id，在首页时为空，在其他分类下就是那些分类的id
    content_count: 0, //当前分类页面下的内容总数或是在首页时是所有内容的总数
    whole_paginal_num: 0,//当前分类页面下的分页页数或是在首页时所有内容的分页页数
    cur_page_num: 1,//当前页码
    per_page_contents_num : 10, //根据业务需求可变的每页展示条数
    cur_page_contents: []
   };下面这个中间件对除通用数据以外的所有数据进行了赋值或初始化
  */
router.get('/', function (req, res, next) {
    data.cur_category = req.query.category || ''; //当前页面的分类的id，在首页时为空，在其他分类下就是那些分类的id
    data.cur_page_num = Number(req.query.page_num || 1);  //当前页码
    data.content_count = 0; //当前分类页面下的内容总数或是在首页时是所有内容的总数
    data.per_page_contents_num = 2;
    data.cur_page_contents = [];
    //根据当前页面是否是首页而设置的可选的查询数据库条件，若是首页则无条件就为{},
    //若是某个分类页，则是
    let where_condition = {};
    if (data.cur_category) {
        where_condition = {'category' : data.cur_category};
    }
    // 读取所有分类信息


        // 读取内容总数目
        contentModel.where(where_condition).count().then(function (content_count) {
            // 内容总数目
            //当前分类页面下的内容总数或是在首页时是所有内容的总数
            data.content_count = content_count || 0;

            // 计算总页数
            //当前分类页面下的分页页数或是在首页时所有内容的分页页数
            data.whole_paginal_num = Math.ceil(data.content_count / data.per_page_contents_num);
            // 下面两个使当前页码的取值区间在[1, data.whole_paginal_num]之间
            data.cur_page_num = Math.min(data.whole_paginal_num, data.cur_page_num);
            data.cur_page_num = Math.max(1, data.cur_page_num);
            let skipped_content_num = (data.cur_page_num - 1) * data.per_page_contents_num;


            return contentModel.where(where_condition)
                .skip(skipped_content_num).limit(data.per_page_contents_num).populate('category author').sort({addTime:-1});



    }).then(function (cur_page_contents) {
        data.cur_page_contents = cur_page_contents;
        console.log(data);
        res.render('./main/index.html', data);
    });

});
/**
 * 内容详情页的展示(除去评论部分，就只有内容的相关展示):从数据库中取到相应内容并展示相应具体信息
 * 传给它的data格式
 * data = {
    userInfo : {},
    author:
    categories: [], //category doc的数组集合
    content //当前详情页的content doc
   };下面这个中间件对除通用数据以外的所有数据进行了赋值或初始化
 */
router.get('/content_detail', function (req, res, next) {

    const content_id = req.query.content_id || '';
    let author_id;
    //找到相应内容文章
    contentModel.findOne({
        _id: content_id
    }).then(function (content) {
        data.content = content;
        content.hits++;
        content.save();


        //获取作者数据
        author_id = content.author;
        return userModel.findById(author_id).then(function(found_author_doc) {
            data.author = found_author_doc.username;
        });
    }).then(function () {
        res.render('./main/content_details.html', data);
    });

});

module.exports = router;