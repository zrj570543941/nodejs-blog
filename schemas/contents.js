/**
 * Created by 毅 on 2016/8/28.
 */

var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({

    //关联字段 - 内容分类的id
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用 代表将要引用的model 值是创建Model时传进mongoose.model的第一个参数
        ref: 'Category'
    },
    // 点击数
    hits: {
        type : Number,
        default: 0
    },
    //内容添加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 文章作者
    author: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用 代表将要引用的model 值是创建Model时传进mongoose.model的第一个参数
        ref: 'User'
    },

    //内容标题
    title: String,



    //简介
    description: {
        type: String,
        default: ''
    },

    //内容
    content: {
        type: String,
        default: ''
    },
    //存储用户的评论
    comments: {
        type: Array,
        default: []
    }
});