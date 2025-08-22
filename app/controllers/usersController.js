const mongoose = require('mongoose')
const { validationResult } = require('express-validator');
const { hashPassword } = require('../services/hashService')
const UserModel = require('../models/UserModel')

const usersList = async (req, res) => {
    let projection = {}

    if (Object.prototype.hasOwnProperty.call(req.query, 'fields')) {
    projection = req.query.fields.split(',').reduce((total, current) => {
        return {[current]:1,...total}
    },{})
}

//pagination
const perPage = 10
const page = req.query.page || 1
const offset =(page -1) * perPage
const usersCount = await UserModel.countDocuments()

//ceil b samt bala rond mikone adad ro
const totalPages = Math.ceil(usersCount / perPage)
    if (page > totalPages || page < 1) {
      return res.status(404).json({
      success: false,
      message: 'This Page Does Not Exist'
    })
}

const users = await UserModel.find({}, projection).limit(perPage).skip(offset)
    res.send({
        success: true,
        message: 'User List Successfully Generated',
        data:{
            users
        },
        meta:{
            page: parseInt(page),
            pages: totalPages,
            next: hasNextPage(page, totalPages) ? `${process.env.APP_URL}/api/v1/admin/userlist?fields=page=${parseInt(page) + 1}`:null,
            prev: hasPrevPage(page, totalPages) ? `${process.env.APP_URL}/api/v1/admin/userlist?fields=page=${page - 1}`:null,
        }
    })
}

    const addUser = async (req, res, next) => {
        try {
    // error Validation
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation Failed',
            errors: errors.array() 
        })
    }

    const { first_name, last_name, mobile, email, password } = req.body;
    
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
        message:'User Created Successfully',
        newUser
    })

    } catch (error) {

        next(error)
    }
}

const getUser = async (req, res, next) => {

    try {
        const { id } = req.body
        if(!id){
            return res.status(400).send({
                error : true,
                message: 'User Not Found'
            })
        }

        const user = await UserModel.findOne({_id:id})
         if(!user){
            return res.status(400).send({
                error : true,
                message: 'User Not Found'
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
    const { id } = req.body

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'User Id Invalid'
      })
    }

    const result = await UserModel.deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found'
      })
    }

    res.json({
      success: true,
      message: 'User Successfully Deleted'
    })
  } catch (error) {
    console.error('Error in removeUser:', error.message)
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'User Id Invalid'
      })
    }

    const result = await UserModel.updateOne({ _id: id }, { ...req.body })

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found'
      })
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Same Information, No Change'
      })
    }

    res.json({
      success: true,
      message: 'User Successfully Updated'
    })
  } catch (error) {
    console.error('Error in updateUser:', error.message)
    next(error)
  }
}

const hasNextPage = (page, totalPages) => {
    return page < totalPages
}
const hasPrevPage = (page) => {
    return page > 1
}

module.exports = {
    usersList,
    addUser,
    getUser,
    removeUser,
    updateUser
}