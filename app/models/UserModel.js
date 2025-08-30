const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    mobile: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    wallet: {type:Number, default:0},
    createdAt: {type:Date, default:Date.now},
    updateAt: {type:Date, default:Date.now},
    role: {type: String, default: 'user'}

})
const userModel = mongoose.model('user', userSchema)

module.exports = userModel