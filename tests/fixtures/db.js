const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/users')
const Task = require('../../src/models/tasks')

const userOneID = new mongoose.Types.ObjectId()
const userOne = {
    name: 'test',
    email: 'test@ccc.com',
    password: 'nmslwdnmd',
    _id: userOneID,
    tokens: [{
        token: jwt.sign({_id: userOneID}, process.env.JWT_SECRET)
    }]
}

const userTwoID = new mongoose.Types.ObjectId()
const userTwo = {
    name: 'test2',
    email: 'test2@aaa.com',
    password: 'wdnmdnmsl',
    _id: userTwoID,
    tokens: [{
        token: jwt.sign({_id: userTwoID}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'game',
    completed: false,
    owner: userOneID
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'stock',
    completed: true,
    owner: userOneID
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'LL',
    completed: true,
    owner: userTwoID
}

const setupDB = async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

const taskOneID = taskOne._id

module.exports = {userOne, setupDB, userOneID, userTwo, taskOneID, taskOne,taskTwo}