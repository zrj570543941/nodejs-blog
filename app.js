const express =  require('express'),
    swig = require('swig'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Cookies = require('cookies'),
    userModel = require('./models/user.js'),
    app = express();

// 静态资源的托管
app.use('/public', express.static(__dirname + '/public/'));
//便于处理客户端发来的post请求数据
app.use(bodyParser.urlencoded({
    extended: true
}));

/**处理客户端发过来的cookies，并把cookies里存的用户信息存入req.uerInfo中,为模板中动态记载html文档内容而用
 * req.uerInfo有以下属性：
 * isAdmin:表示当前用户是否是管理员的布尔值
 * username：当前用户的用户名
 * _id
 */
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    if (req.cookies.get('userInfo')) {

        req.userInfo = JSON.parse(req.cookies.get('userInfo'));
        const username = decodeURIComponent(req.userInfo.username);
        // 处理当前用户是否是admin，写入isAdmin属性中
        userModel.findOne({
            username: username
        }).then(function (userdoc) {

            req.userInfo.isAdmin = userdoc.isAdmin ? true : false;
            next();

        });
    } else {
        next();
    }

});

/*开始模板引擎的相关设置*/
app.engine('html', swig.renderFile);
app.set('views', './views/');
app.set('views engine', 'html');
swig.setDefaults({cache: false});
/*结束模板引擎的相关设置*/



/*
 * 根据用户提交的url访问是管理模块，api模块，还是前台展示模块，
 * 划分不同的功能模块分别进行处理
 * */
app.use('/admin', require('./routers/admin')); //管理模块
app.use('/api', require('./routers/api')); //api模块
app.use('/', require('./routers/main')); //前台展示模块

// 连接数据库
mongoose.connect('mongodb://localhost:27018', function (err) {
    if (err) {
        console.log('连接数据库失败', err);
    } else {
        app.listen('8080', 'localhost');
        console.log('连接数据库成功');
    }
});



