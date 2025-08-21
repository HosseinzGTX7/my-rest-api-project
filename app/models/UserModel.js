const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    mobile:String,
    email:String,
    password: {type: String, required: true},
    wallet:{type:Number, default:0},
    createdAt:{type:Date, default:Date.now},
    updateAt:{type:Date, default:Date.now},
    role: { type: String, default: 'user' }

})
const userModel = mongoose.model('user', userSchema)

module.exports = userModel