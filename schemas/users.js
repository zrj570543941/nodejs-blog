/**
 * Created by Administrator on 2017/1/27.
 */

const mongoose = require('mongoose'),
    userSchema = new mongoose.Schema({
        username: String,
        password: String,
        isAdmin : {
            type: Boolean,
            default: false
        }
    });
module.exports = userSchema;