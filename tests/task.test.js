const request = require('supertest');
const app = require('../src/app')
const Task = require('../src/models/tasks')
const {userOne, setupDB, userTwo, taskOneID, taskOne, taskTwo} = require('./fixtures/db')

beforeEach(setupDB)

test('Should create a new task', async()=>{
    const res = await request(app).post('/tasks')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({description: 'fgo'})
        .expect(201)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should read tasks correctly', async()=>{
    const res = await request(app).get('/tasks')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2)
    
})

test('Should not delete tasks of others', async()=>{
    await request(app).delete(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOneID)
    expect(task).not.toBeNull()
})

// Extra tests

// Should not create task with invalid description/completed
test('Should not create a new task with invalid description/completed', async()=>{
    await request(app).post('/tasks')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({completed: 123,description: 'dqdw'})
        .expect(400)

    await request(app).post('/tasks')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({description:{ ods: 'dqdw'}})
        .expect(400)
})

// Should not update task with invalid description/completed
test('Should not update task with invalid description/completed', async()=>{
    await request(app).patch(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({completed: 123})
        .expect(400)

    await request(app).patch(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({description: {num: 123}})
        .expect(400)
})


// Should delete user task
test('Should delete user task', async()=>{
    await request(app).delete(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOneID)
    expect(task).toBeNull()
})

// Should not delete task if unauthenticated
test('Should not delete task if unauthenticated', async()=>{
    await request(app).delete(`/tasks/${taskOneID}`)
        .send()
        .expect(401)

    const task = await Task.findById(taskOneID)
    expect(task).not.toBeNull()
})

// Should not update other users task
test('Should not update other users task', async()=>{
    const taskorigin = await Task.findById(taskOneID)
    await request(app).patch(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send({description: 'apex'})
        .expect(404)

    const task = await Task.findById(taskOneID)
    expect(task).toEqual(taskorigin)
})

// Should fetch user task by id
test('Should fetch user task by id', async()=>{
    const res = await request(app).get(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.description).toEqual(taskOne.description)
    expect(res.body.completed).toEqual(taskOne.completed)
})


// Should not fetch user task by id if unauthenticated
test('Should not fetch user task by id if unauthenticated', async()=>{
    await request(app).get(`/tasks/${taskOneID}`)
        .send()
        .expect(401)
})

// Should not fetch other users task by id
test('Should not fetch other users task by id', async()=>{
    await request(app).get(`/tasks/${taskOneID}`)
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

// Should fetch only completed tasks
test('Should fetch only completed tasks', async()=>{
    const taskcompleted = await Task.find({completed: true, owner: userOne._id})
    const res = await request(app).get(`/tasks?completed=true`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(taskcompleted.length)
    expect(res.body[0].completed).toEqual(true)
})

// Should fetch only incomplete tasks
test('Should fetch only incomplete tasks', async()=>{
    const taskcompleted = await Task.find({completed: false, owner: userOne._id})
    const res = await request(app).get(`/tasks?completed=false`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(taskcompleted.length)
    expect(res.body[0].completed).toEqual(false)
})

// Should sort tasks by description/completed/createdAt/updatedAt
test('Should sort tasks by completed/createdAt', async()=>{
    const res = await request(app).get(`/tasks?sortby=completed:desc`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(2)
    expect(res.body[0].description).toEqual(taskTwo.description)

    const res2 = await request(app).get(`/tasks?sortby=createdAt:desc`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res2.body.length).toEqual(2)
    expect(res2.body[0].description).toEqual(taskTwo.description)
})

// Should fetch page of tasks
test('Should fetch page of tasks', async()=>{
    const res = await request(app).get(`/tasks?limit=1&skip=1`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.length).toEqual(1)
    expect(res.body[0].description).toEqual(taskTwo.description)
})



