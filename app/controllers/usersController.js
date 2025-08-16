const { reduce } = require('lodash')
const { hashPassword } = require('../services/hashService')
const UserModel = require('../models/UserModel')
const usersList = async (req, res, next) => {
    
    let projection = {}

    if (Object.prototype.hasOwnProperty.call(req.query, 'fields')) {
    projection = req.query.fields.split(',').reduce((total, current) => {
        return {[current]:1,...total}
    },{})
}

//pagination
const perPage = 1
const page = req.query.page || 1
const offset =(page -1) * perPage
const usersCount = await UserModel.countDocuments()
//ceil b samt bala rond mikone adad ro
const totalPages = Math.ceil(usersCount / perPage)

const users = await UserModel.find({}, projection).limit(perPage).skip(offset)
    res.send({
        success: true,
        message: 'لیست کاربران با موفقیت تولید شد',
        data:{
            users
        },
        meta:{
            page: parseInt(page),
            pages: totalPages,
            next: hasNextPage(page, totalPages) ? `${process.env.APP_URL}/api/v1/users?=${parseInt(page) + 1}`:null,
            prev: hasPrevPage(page, totalPages) ? `${process.env.APP_URL}/api/v1/users?=${page - 1}`:null,
        }
    })
}

const addUser = async (req, res, next) => {

    try {
    const {first_name, last_name, mobile, email, password} = req.body
    
    if(!first_name || !last_name || !password)
    {
        return res.status(422).send({
            error: true,
            message:'اطلاعات ارسالی برای ایجاد کاربر معتبر نمی باشد'
        })
    }

    const hashedPassword = await hashPassword(password)
    
    const newUser = new UserModel({
        first_name,
        last_name,
        mobile,
        email,
        password: hashedPassword
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

const hasNextPage = (page, totalPages) => {
    return page < totalPages;
}
const hasPrevPage = (page) => {
    return page > 1;
}

module.exports = {
    usersList,
    addUser,
    getUser,
    removeUser,
    updateUser
}