const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    }, 
    completed: {
        type: Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    images:[{
        image: {
            type: Buffer
        }
    }]
},{
    timestamps: true
})

taskSchema.methods.toJSON = function() {
    const task = this;
    const taskObject = task.toObject()
    
    if(taskObject.images.length > 0){
        taskObject.images.forEach((val)=> delete val.image)
    }

    return taskObject

}


const Task = mongoose.model('Task',taskSchema)

module.exports = Task

