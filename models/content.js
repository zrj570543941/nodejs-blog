/**
 * Created by Administrator on 2017/2/3.
 */
const mongoose = require('mongoose'),
    contentSchema = require('../schemas/contents.js');

module.exports = mongoose.model("Content", contentSchema);