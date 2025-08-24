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
        return res.status(200).json({
            Success: false,
            Message: 'Input Incomplete',
            Status: 400,
            Errors: errors.array() 
        })
    }

  const { first_name, last_name, mobile, email, password } = req.body

  // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({
        Success: false,
        Message: 'Email Format Invalid',
        Status: 422
      })
    }

    // Password length check
    if (!password || password.length < 8) {
      return res.status(422).json({
        Success: false,
        Message: 'Password Must Be At Least 8 Characters',
        Status: 422
      })
    }

    // Duplicate email check
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      Success: false,
      Message: 'Email Already Exists',
      Status: 409
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
        message:'User Created Successfully',
        Status: 201,
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
            return res.status(200).send({
                Success: false,
                Message: 'Input Invalid',
                Status: 400
            })
        }

        const user = await UserModel.findOne({_id:id})
         if(!user){
            return res.status(200).send({
                Success: false,
                Message: 'User Not Found',
                Status: 404
            })
        }
        return res.send({
                Success: true,
                Status: 200,
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
      return res.status(200).json({
        Success: false,
        Message: 'User Id Invalid',
        Status: 400
      })
    }

    const result = await UserModel.deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return res.status(200).json({
        Success: false,
        Message: 'User Not Found',
        Status: 404
      })
    }

    return res.status(200).json({
      Success: true,
      Message: 'User Successfully Deleted',
      Status: 200
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
      return res.status(200).json({
        Success: false,
        Message: 'User Id Invalid',
        Status: 400
      })
    }

    const result = await UserModel.updateOne({ _id: id }, { ...req.body })

    if (result.matchedCount === 0) {
      return res.status(200).json({
        Success: false,
        Message: 'User Not Found',
        Status: 404
      })
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        Success: false,
        Message: 'Same Information, No Change',
        Status: 409
      })
    }

    return res.status(200).json({
      Success: true,
      Message: 'User Successfully Updated',
      Status: 200
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