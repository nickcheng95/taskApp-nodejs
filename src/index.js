// /Users/nickc/mongodb/bin/mongod.exe --dbpath=/Users/nickc/mongodb-data
// cd desktop/nodejs/task-manager


const app = require('./app')
const port = process.env.PORT;

app.listen(port,()=>{
    console.log('Running on ' + port)
})

