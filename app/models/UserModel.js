const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    first_name: {String, require: true},
    last_name: {String, require: true},
    mobile: {String, require: true},
    email: {String, require: true},
    password: {type: String, required: true},
    wallet: {type:Number, default:0},
    createdAt: {type:Date, default:Date.now},
    updateAt: {type:Date, default:Date.now},
    role: {type: String, default: 'user'}

})
const userModel = mongoose.model('user', userSchema)

module.exports = userModel