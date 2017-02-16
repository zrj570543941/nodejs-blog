/**
 * Created by Administrator on 2017/2/2.
 */


const mongoose = require('mongoose'),
    // 分类的表结构
    categorySchema = new mongoose.Schema({
        // 分类名称
        name: String

    });
module.exports = categorySchema;
