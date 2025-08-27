const AppError = require('../utils/appError')
const mongoose = require('mongoose')
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
      Success: false,
      Message: 'This Page Does Not Exist'
    })
}

const users = await UserModel.find({}, projection).limit(perPage).skip(offset)
    res.send({
        Success: true,
        Message: 'User List Successfully Generated',
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
  //ghable rout to middleware validation check mishe
  try {
    const { first_name, last_name, mobile, email, password } = req.body

    if (!first_name || !last_name || !mobile || !email || !password) {
      return next(new AppError('All fields are required', 400));
    }

    const existingMobile = await UserModel.findOne({ mobile })
    if (existingMobile) {
      return next(new AppError('Mobile number already exists', 403))
    }
    
    const existingEmail = await UserModel.findOne({ email })
    if (existingEmail) {
      return next(new AppError('Email already exists', 405))
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

    res.status(201).json({
      Status: 'success',
      Message: 'User created successfully',
      data: newUser
    });

  } catch (error) {
    next(error)
  }
}

const getUser = async (req, res, next) => {
  try {
    const { id } = req.body
    if (!id) {
      return next(new AppError('Input Invalid', 400))
    }

    const user = await UserModel.findOne({ _id: id })
    if (!user) {
      return next(new AppError('User Not Found', 404))
    }

    return res.status(200).json({
      Success: true,
      Status: 200,
      data: { user }
    })

  } catch (error) {
    next(error)
  }
}

const removeUser = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('User Id Invalid', 400))
    }

    const result = await UserModel.deleteOne({ _id: id })
    if (result.deletedCount === 0) {
      return next(new AppError('User Not Found', 404))
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
    const { id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('User Id Invalid', 400))
    }

    const result = await UserModel.updateOne({ _id: id }, { ...req.body })
    if (result.matchedCount === 0) {
      return next(new AppError('User Not Found', 404))
    }

    if (result.modifiedCount === 0) {
      return next(new AppError('Same Information, No Change', 409))
    }

    res.status(200).json({
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