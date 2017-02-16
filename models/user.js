/**
 * Created by Administrator on 2017/1/27.
 */


const mongoose = require('mongoose'),
    userSchema = require('../schemas/users.js');

module.exports = mongoose.model("User", userSchema);
