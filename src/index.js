// /Users/nickc/mongodb/bin/mongod.exe --dbpath=/Users/nickc/mongodb-data
// cd desktop/nodejs/task-manager

const express = require('express');
require('./db/mongoose')
const userRouter = require('./routers/users');
const taskRouter = require('./routers/tasks');

const app = express();
const port = process.env.PORT;


app.use(express.json());
app.use(userRouter)
app.use(taskRouter)



app.listen(port,()=>{
    console.log('Running on ' + port)
})

