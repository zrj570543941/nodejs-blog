/**
 * Created by Administrator on 2017/1/27.
 */

const express = require('express'),
    userModel = require('../models/user.js'),
    contentModel = require('../models/content.js'),
    Cookies = require('cookies'),
    router = express.Router();

//初始化要返会给浏览器的代表注册是否成功的变量
var responseData = {};
router.use(function (res, req, next) {
    responseData = {
        code: 0, //错误信息代码，为0时无错误
        message: '' //错误具体信息，为空字符串时无错误信息
    };
    next();
});




/**用户注册功能的后台验证功能；
 *   1.用户名不能为空
 *   2.密码不能为空
 *   3.两次输入密码必须一致
 *
 *   4.用户之前是否已经被注册了
 *
* */
router.post('/user/register', function (req, res, next) {
    const regsisterData = req.body,
    username = req.body.username,
    password = req.body.password,
    repassword = req.body.repassword;

    //用户是否为空
    if ( username == '' ) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    //密码不能为空
    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    //两次输入的密码必须一致
    if (password != repassword) {
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }
    //检查用户之前是否已经被注册了
    userModel.findOne({
        username: username
    //表示数据库中有该记录，即用户之前已被注册过
    }).then(function (result) {
            if ( result ) {

                responseData.code = 4;
                responseData.message = '用户名已经被注册了';
                res.json(responseData);
            } else {
                const newUser = new userModel({
                    username: username,
                    password: password
                });
                return newUser.save();
            }
        //表示数据库中无该记录，即用户之前没注册过
    }).then(function () {
        responseData.message = '注册成功！';
        res.json(responseData);
    });



});





/**用户登录功能的后台验证功能；
 *   1.用户名和密码不能为空
 *   2.查询数据库看账户和密码是否都正确
 *   3.
 *
 *   4.若登录成功，发送cookie给客户端
 *
 * */
router.post('/user/login', function (req, res, next) {
    const username = req.body.username,
        password = req.body.password;

    if ( username === '' || password === '' ) {
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }

    //查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
    userModel.findOne({
        username: username,
        password: password
    }).then(function(userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        //用户名和密码是正确的,登陆成功的一些操作
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };

        //把登录成功后相关登录用户信息的cookies发给客户端，
        //      若客户端之前存过userinfo的cookie则更新相关cookie
        const cookie_value = JSON.stringify({
            _id: userInfo._id,
            username: encodeURIComponent(userInfo.username)
        });
        req.cookies.set('userInfo', cookie_value);

        res.json(responseData);
    })
});






/**用户退出登录功能的后台清除cookies功能

 *
 * */
router.get('/user/logout', function (req, res, next) {
    req.cookies.set('userInfo', null);
    responseData.message = '退出成功！';
    res.json(responseData);

});

/**
 * 用户进入内容详情页即刻加载所有评论
 */
/*
 * 每次内容详情页面重载获取指定文章的所有评论传给前端
 * */
router.get('/comment', function(req, res) {
    const rel_content_id = req.query.content_id || '';

    contentModel.findOne({
        _id: rel_content_id
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

/**
 * 用户在内容页提交评论时展示所有评论
 */
router.post('/comment/post', function (req, res, next) {
    //评论所属内容的id
    const rel_content_id = req.body.content_id || '';
    var postedData = {
        username: req.userInfo.username,
        commentTime: new Date(),
        comment_content: req.body.comment_content
    };
    //查询到相应内容并更新里面的评论相关信息
    contentModel.findById(rel_content_id).then(function (found_content) {
        found_content.comments.push(postedData);
        return found_content.save();
    }).then(function (updated_content) {
        responseData.message = '评论成功';
        //把该内容（包括所有评论）发送给前端
        responseData.content = updated_content;
        res.json(responseData);
    });
});

module.exports = router;