/**
 * Created by Administrator on 2017/1/27.
 */
const express = require('express'),
    router = express.Router(),
    userModel = require('../models/user.js'),
    categoryModel = require('../models/category.js'),
    contentModel = require('../models/content.js');


router.use(function (req, res, next) {
    if (!req.userInfo ||  req.userInfo.isAdmin === false) {

        res.send('对不起，只有管理员可以进入该页面！');
        return;
    }
    next();
});



// 进入后台管理首页
router.get('/', function (req, res) {
    res.render('./admin/index.html', {
        userInfo: req.userInfo
    });
});




// 确定该数据列表页的分页总的页数，并返回一个promise，它的resolve handler会传进分页总页数变量
function confirmWholePaginalNum(Model, per_page_searched_users_num) {
    let whole_users_num,
        whole_paginal_num;
    return Model.find({}).then(function (userLists) {
        whole_users_num = userLists ? userLists.length : 0;
        return whole_paginal_num = Math.ceil(whole_users_num / per_page_searched_users_num);
    });
}
/**进入各个管理页面的数据列表页的数据展示功能以及上一页下一页功能,
 * 根据
 * 当前分页（点击分页组件各链接跳转之后的）页码数：cur_page_num
 * 和一页所要展示数据数：per_page_searched_users_num
 * 读取数据库中所有用户数据并展示
 * cur_page_num表示点击分页各个按钮跳转之后的页面的页码，而非跳转之前的页码
 * prev_page_num表示相对于跳转之后的页面所在页码数的上一页的页码数
 * next_page_num表示相对于跳转之后的所在页面页码数的下一页的页码数
 * 各参数解释：
 * Model:表示将要搜索的数据库的model名字
 * per_page_searched_users_num：每页要展示的数据条数
 * rendered_html：将要传给前台的模板页面
 * admin_item：当前模板页面所管理的子项，如是用户管理，还是分类管理页面。
 *              用户管理叫'user'，分类管理叫'category',主要用于正确指定各分类下分页按钮的链接href
 */
function showPaging(Model, per_page_searched_users_num, rendered_html, admin_item, req, res) {
    confirmWholePaginalNum(Model, per_page_searched_users_num).then(function (whole_paginal_num) {
        const cur_page_num = req.query.page_number && Number(req.query.page_number) >= 1 ? Number(req.query.page_number) : 1,
            prev_page_num = cur_page_num - 1 >= 1 ? cur_page_num - 1 : 1,
            next_page_num = cur_page_num + 1 <=  whole_paginal_num ? cur_page_num + 1 : whole_paginal_num;

        let skip_num = (cur_page_num - 1) * per_page_searched_users_num;
        //根据whole_paginal_num做相应的页码数组的集合
        let page_num_arr = [];
        for (let i = 1; i <= whole_paginal_num; i++) {
            page_num_arr.push(i);
        }
        // page_num_arr = Object.keys(page_num_arr);
        // page_num_arr.forEach(function(val, i, arr) {
        //     console.log(i, arr);
        //     arr[i] = i;
        // });
        // 查找确定页码下的数据并显示
        Model.find({}).sort({_id: -1}).limit(per_page_searched_users_num).skip(skip_num).then(function (datalists) {
            res.render(rendered_html, {
                userInfo: req.userInfo,
                datalists: datalists,
                whole_paginal_num: whole_paginal_num,
                page_num_arr: page_num_arr,
                prev_page_num: prev_page_num,
                next_page_num: next_page_num,
                admin_item: admin_item
            });
        })
    });

}
/**
 * 相对于ver1的变化就在于path这个参数的增加，表示Model中哪些key是要被doc所populate的
 */
function showPagingVer2(Model, per_page_searched_users_num, rendered_html, admin_item, paths, req, res) {
    confirmWholePaginalNum(Model, per_page_searched_users_num).then(function (whole_paginal_num) {
        const cur_page_num = req.query.page_number && Number(req.query.page_number) >= 1 ? Number(req.query.page_number) : 1,
            prev_page_num = cur_page_num - 1 >= 1 ? cur_page_num - 1 : 1,
            next_page_num = cur_page_num + 1 <=  whole_paginal_num ? cur_page_num + 1 : whole_paginal_num;

        let skip_num = (cur_page_num - 1) * per_page_searched_users_num;

        //根据whole_paginal_num做相应的页码数组的集合
        let page_num_arr = [];
        for (let i = 1; i <= whole_paginal_num; i++) {
            page_num_arr.push(i);
        }

        // 查找确定页码下的数据并显示
        Model.find({}).sort({_id: -1}).limit(per_page_searched_users_num).skip(skip_num).populate(paths).then(function (datalists) {
            res.render(rendered_html, {
                userInfo: req.userInfo,
                datalists: datalists,
                whole_paginal_num: whole_paginal_num,
                page_num_arr: page_num_arr,
                prev_page_num: prev_page_num,
                next_page_num: next_page_num,
                admin_item: admin_item
            });
        })
    });
}
function jumpToEditDoc(Model, rendered_html_when_succ, err_message, req, res) {
    const id = req.query.id;

    if (id) {
        Model.findById(id).then(function(found_doc) {

            if (!found_doc) {
                res.render('./admin/error', {
                    userInfo: req.userInfo,
                    err_message: err_message
                });
            } else {
                res.render(rendered_html_when_succ, {
                    userInfo: req.userInfo,
                    found_doc: found_doc
                });
            }
        });
    }
}
/**进入用户管理首页*/
router.get('/user', function (req, res) {
    showPaging(userModel, 2, './admin/users.html', 'user', req, res);
});




// 进入分类管理首页
router.get('/category', function (req, res) {
    // res.render('./admin/category_index.html', {
    //     userInfo: req.userInfo
    // });
    showPaging(categoryModel, 2, './admin/category_index.html', 'category', req, res);
});
// 分类管理首页的修改链接功能
router.get('/category/edit', function (req, res) {
    const category_id = req.query.id;

    if (category_id) {
        categoryModel.findById(category_id).then(function(found_category) {

            if (!found_category) {
                res.render('./admin/error', {
                    userInfo: req.userInfo,
                    err_message: '分类信息不存在'
                });
            } else {
                res.render('./admin/category_edit.html', {
                    userInfo: req.userInfo,
                    found_category: found_category
                });
            }
        });
    }
});
/**分类管理的修改后保存修改功能
 * 1.检查当前要修改的分类是否已存在于数据库中
 * 2.检查已修改过的name值是否等于未修改前的name值
 * 3.检查数据库中其他id下的doc的name是否有同样的name值
 *
 * 上述三个条件都满足方修改成功
  */
router.post('/category/edit', function (req, res, next) {
    const category_id = req.query.id,
        have_modified_name = req.body.name;

    //获取要修改的分类信息
    categoryModel.findOne({
        _id: category_id
    }).then(function(category) {

        if (!category) {
            // 当前要修改的分类不存在于数据库中
            res.render('./admin/error.html', {
                userInfo: req.userInfo,
                err_message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            // 当前要修改的分类存在于数据库中
            //当用户没有对分类名做任何的修改提交的时候

            if (have_modified_name == category.name) {
                res.render('./admin/error.html', {
                    userInfo: req.userInfo,
                    err_message: '分类名称同之前的分类名称',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {

                // 当前要修改的分类存在于数据库中
                //并且修改过的分类名并不等于原修改前的分类名
                return categoryModel.findOne({
                    _id: {$ne: category_id},
                    name: have_modified_name
                });
            }
        }

    }).then(function(sameCategory) {

        if (sameCategory) {
            console.log(sameCategory);
            // 当前要修改的分类存在于数据库中
            //并且修改过的分类名并不等于原修改前的分类名
            // 但是数据库中有其他id下的doc的name等于此刻修改后的name
            res.render('./admin/error.html', {
                userInfo: req.userInfo,
                err_message: '数据库中已经存在同名分类'
            });
            return Promise.reject();
        } else {
            // 当前要修改的分类存在于数据库中
            //并且修改过的分类名并不等于原修改前的分类名
            // 并且数据库中并无其他id下的doc的name等于此刻修改后的name
            return categoryModel.update({
                _id: category_id
            }, {
                name: have_modified_name
            });

        }
    }).then(function() {
        res.render('./admin/success.html', {
            userInfo: req.userInfo,
            succ_message: '修改成功',
            url: '/admin/category'
        });
    });


});

/**分类管理的删除功能
 * 1.检查当前要删除的分类是否已存在于数据库中
 *
 * 上述条件都满足方修改成功
 */
router.get('/category/delete', function (req, res, next) {
    const category_id = req.query.id,
        have_modified_name = req.body.name;

    //获取要删除的分类信息
    categoryModel.findOne({
        _id: category_id
    }).then(function(category) {

        if (!category) {
            // 当前要删除的分类不存在于数据库中
            res.render('./admin/error.html', {
                userInfo: req.userInfo,
                err_message: '删除失败，要删除的分类本就不存在'
            });
            return Promise.reject();
        } else {
            // 当前要删除的分类存在于数据库中
            return categoryModel.remove({
                _id: category_id
            });

        }
    }).then(function() {
        res.render('./admin/success.html', {
            userInfo: req.userInfo,
            succ_message: '删除成功'
        });
    });



});

// 进入添加分类页面
router.get('/category/add', function (req, res, next) {
    res.render('./admin/category_add.html', {
        userInfo: req.userInfo
    });
});

/**添加分类页面添加分类功能，即提交表格之后的功能
 * 首先添加的分类不能为空
 * 其次添加的分类在数据中不能已经存在
  */
router.post('/category/add', function (req, res, next) {
    // console.log(req.body);
    const category_name = req.body.name;
    // 检查添加的分类不能为空
    if (!req.body.name) {
        res.render('./admin/error.html', {
            userInfo: req.userInfo,
            err_message: '名称不能为空'
        });
        return;
    }
    // 检查添加的分类在数据中不能已经存在
    categoryModel.findOne({
        name: category_name
    }).then(function (result) {
        // 如果数据库中已存在
        if (result) {
            res.render('./admin/error.html', {
                userInfo: req.userInfo,
                err_message: '数据中已存在该分类'
            });
        // 如果数据库不存在该分类，则添加该分类
        } else {
            new categoryModel({ name: category_name }).save();
            res.render('./admin/success.html', {
                userInfo: req.userInfo,
                succ_message: '分类添加成功',
                url: '/admin/category'
            });
        }
    });
});





/**
 * 进入内容管理首页
 */
router.get('/content', function (req, res) {
    // res.render('./admin/content_index.html', {
    //     userInfo: req.userInfo
    // });
    showPagingVer2(contentModel, 2, './admin/content_index.html', 'content', 'category author', req, res);
});
/**
 * 内容管理首页的修改链接功能
 * 使未改前的分类默认被选中
 * 所有未修改前的文本都先默认展示出来供用户更改
 */
router.get('/content/edit', function (req, res) {
    // jumpToEditDoc(contentModel, './admin/content_edit.html', '指定内容不存在', req, res);
    const id = req.query.id || '';

    let categories = [];

    categoryModel.find().sort({_id: 1}).then(function(rs) {

        categories = rs;

        return contentModel.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {

        if (!content) {
            res.render('./admin/error.html', {
                userInfo: req.userInfo,
                err_message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('./admin/content_edit.html', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            })
        }
    });
});
/**
 * 内容管理修改后的保存功能
 * 1.读取数据库中分类信息动态添加至分类下拉选择列表中
 */
router.post('/content/edit', function (req, res) {
    const id = req.query.id;
    if ( req.body.category == '' ) {
        res.render('./admin/error.html', {
            userInfo: req.userInfo,
            err_message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('./admin/error.html', {
            userInfo: req.userInfo,
            err_message: '内容标题不能为空'
        })
        return;
    }

    contentModel.update(
        { _id: id},
        {
            category: req.body.category,
            title: req.body.title,
            description: req.body.description,
            content: req.body.content
        }
    ).then(function (updated_rs) {
        console.log(updated_rs);
        res.render('./admin/success.html', {
            userInfo: req.userInfo,
            succ_message: '内容保存成功',
            url: '/admin/content/edit?id=' + id
        });
    });
});
router.get('/content/delete', function (req, res) {
    const id = req.query.id;
    contentModel.findById(id).remove({_id: id}).then(function () {
        res.render('./admin/success.html', {
            userInfo: req.userInfo,
            succ_message: '内容删除成功',
            url: '/admin/content'
        })
    })
});
/**
 * 进入内容添加页面
 */
router.get('/content/add', function (req, res) {
    // 读取数据库中分类信息动态添加至分类下拉选择列表中
    categoryModel.find().sort({_id: -1}).then(function (category_lists) {
        if (category_lists.length > 0) {
            res.render('./admin/content_add.html', {
                userInfo: req.userInfo,
                category_lists: category_lists
            });
        } else {
            res.render('./admin/error.html', {
                userInfo: req.userInfo,
                err_message: '无分类信息！'
            });
        }
    });

});
/**
 * 内容添加页面的提交表单功能
 * 1.验证内容分类不能为空
 * 2.验证内容标题不能为空
 * 3.author,category以id占好位置为后面进入内容修改页面populate而用
 */
router.post('/content/add', function (req, res) {

    // 验证内容分类不能为空
    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            err_message: '内容分类不能为空'
        })
        return;
    }
    // 验证内容标题不能为空
    if ( req.body.title == '' ) {
        res.render('./admin/error.html', {
            userInfo: req.userInfo,
            err_message: '内容标题不能为空'
        });
        return;
    }
    // 验证通过就保存内容至数据库中

        new contentModel({
            category: req.body.category,
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            author: req.userInfo._id.toString()
        }).save().then(function(newed) {
            res.render('./admin/success.html', {
                userInfo: req.userInfo,
                succ_message: '内容保存成功',
                url: '/admin/content'
            });
        });

});



module.exports = router;
