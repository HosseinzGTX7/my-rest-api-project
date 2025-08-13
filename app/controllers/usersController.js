const { reduce } = require('lodash')
const UserModel = require('../models/UserModel')
const usersList = async (req, res, next) => {
    
    let projection = {}

    if (Object.prototype.hasOwnProperty.call(req.query, 'fields')) {
    projection = req.query.fields.split(',').reduce((total, current) => {
        return {[current]:1,...total}
    },{})
}
    const users = await UserModel.find({}, projection)
    res.send({
        success: true,
        message: 'لیست کاربران با موفقیت تولید شد',
        data:{
            users
        }
    })
}

const addUser = async (req, res, next) => {

    try {
    const {first_name, last_name, mobile, email} = req.body
    
    if(first_name == undefined || last_name == undefined || first_name == "" || last_name == "")
    {
        return res.status(422).send({
            error: true,
            message:'اطلاعات ارسالی برای ایجاد کاربر معتبر نمی باشد'
        })
    }
    
    const newUser = new UserModel({
        first_name,
        last_name,
        mobile,
        email
    })

    await newUser.save()
    res.status(201).send({
        success:true,
        message:'کاربر جدید با موفقیت ایجاد شد',
        newUser
    })

    } catch (error) {

        next(error)
    }
}

const getUser = async (req, res, next) => {

    try {
        const {id} = req.params
        if(!id){
            return res.status(400).send({
                error : true,
                message: 'کاربری با این مشخصات یافت نشد'
            })
        }

        const user = await UserModel.findOne({_id:id})
         if(!user){
            return res.status(400).send({
                error : true,
                message: 'کاربری با این مشخصات یافت نشد'
            })
        }
        return res.send({
                success: true,
                data:{
                    user
                }
            })

    } catch (error) {

        next(error)
    }

}

const removeUser = async (req, res, next) => {
    try {
        const {id} = req.params
        if(!id){
            return res.status(400).send({
                error : true,
                message: 'کاربری با این مشخصات یافت نشد'
            })
        }
    await UserModel.deleteOne({_id:id})
    res.send({

        success: true,
        message: 'کاربر با موفقیت حذف شد'

    })
        
    } catch (error) {
        next(error)
    }
}

const updateUser = async (req, res, next) => {
    try {
        const {id} = req.params
        if(!id){
            return res.status(400).send({
                error : true,
                message: 'کاربری با این مشخصات یافت نشد'
            })
        }
    const {n, nmodified} = await UserModel.updateOne({_id:id}, {...req.body})
    if(n==0 || nmodified===0)
        throw new Error('عملیات به روز رسانی با خطا مواجه شد')
    
    res.send({

        success: true,
        message: 'کاربر با موفقیت آپدیت شد'

    })
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    usersList,
    addUser,
    getUser,
    removeUser,
    updateUser
}