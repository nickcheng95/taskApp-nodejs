const express = require('express');
const router = new express.Router();
const Task = require('../models/tasks');
const auth = require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp');
const {ObjectID} = require('mongodb')

router.post('/tasks', auth, async(req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try{
        await task.save();
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }

})

router.get('/tasks', auth, async(req,res)=>{
    const match = {}
    const sort = {}
    
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortby){
        const parts = req.query.sortby.split(':');

        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    
    
    try{
        // const tasks = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/tasks/:id', auth, async(req,res)=>{
    const _id = req.params.id
    
    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async(req,res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid operation'})
    }

    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        
        if(!task){
            return res.status(404).send()
        }   

        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)

    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req,res)=>{
    const _id = req.params.id

    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)

    }catch(e){
        res.status(500).send(e)
    }
})

// upload images for tasks
const upload = multer({
    limits:{
        fileSize: 6000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be a image'))
        }

        cb(undefined, true)
    }
})

router.post('/tasks/:id/image', auth, upload.single('image'), async(req,res)=>{
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
    if(!task){
        throw new Error('Task not found')
    }

    task.images = task.images.concat({image: buffer})
    await task.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/tasks/:id/image/:imgid', auth, async(req,res)=>{
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send('Task not found')
        }

        const length = task.images.length
        if(length === 0){
            return res.status(404).send('Images not found')
        }

        task.images = task.images.filter((val) => val._id.toString() !== req.params.imgid)

        if(task.images.length === length){
            return res.status(404).send('Image not found')
        }
        await task.save()
        res.send()

    }catch(error){
        res.status(500).send({error: error.message})
    }
})

router.get('/tasks/:id/image/:imgid', auth, async(req,res)=>{
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if(!task){
            throw new Error('Task not found')
        }

        const {image} = task.images.find((val)=> val._id.toString() === req.params.imgid)
        if(!image){
            throw new Error()
        }
        
        res.set('Content-Type','image/png')
        res.send(image)
    }catch(e){
        res.status(404).send({error: e.message})
    }
})

module.exports = router