/**
 * Created by Administrator on 2017/2/2.
 */

const mongoose = require('mongoose'),
    categoriesSchema = require('../schemas/categories.js');

module.exports = mongoose.model("Category", categoriesSchema);
