const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    first_name: {type: String, required: true, minlength: 2},
    last_name: {type: String, required: true, minlength: 2},
    mobile: {type: String, required: true, match: [/^09\d{9}$/] },
    email: {type: String, required: true, match: [/^\S+@\S+\.\S+$/]},
    password: {type: String, required: true},
    wallet: {type:Number, default:0},
    createdAt: {type:Date, default:Date.now},
    updateAt: {type:Date, default:Date.now},
    role: {type: String, default: 'user'}

})
const userModel = mongoose.model('user', userSchema)

module.exports = userModel