const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    age: {
        type: Number,
        default: 0,
        validate(val){
            if(val<0){
                throw new Error('Age must be positive number')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('Email invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('Do not put password in the string')
            }
        }
        
    },
    tokens: [{
        token: {
            type: String,
            required: true

        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
});

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async(email,password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to login')
    }    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user

}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();
    
    return token

}

// Hash the password
userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User


