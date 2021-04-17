const request = require('supertest');
const app = require('../src/app')
const User = require('../src/models/users')
const {userOne, setupDB, userOneID} = require('./fixtures/db')

beforeEach(setupDB)


test('Should signup a new user', async()=>{
    const response = await request(app).post('/users').send({
        name: 'ZJ',
        email: 'ccc@aaa.com',
        password: '12345678'
    }).expect(201)
    
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({
        user:{
            name: 'ZJ',
            email: 'ccc@aaa.com' 
        } 
    })
    expect(user.password).not.toBe('12345678')
})

test('Should login exisiting user', async()=>{
    const res = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(res.body.user._id);
    expect(res.body.token).toBe(user.tokens[1].token)
})


test('Should not login with nonexisiting user', async()=>{
    await request(app).post('/users/login').send({
        email: 'ddsad@dasda.com',
        password: 'asdd12sda'
    }).expect(400)
})

test('Should get Profile', async()=>{
    await request(app).get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get Profile for unauth user', async()=>{
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Should delete user', async()=>{
    await request(app).delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneID)
    expect(user).toBeNull()
})

test('Should not delete user if unauthenticated', async()=>{
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async()=>{
    await request(app).post('/users/me/avatar')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile.jpg')
        .expect(200)
    const user = await User.findById(userOneID)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async()=>{
    await request(app).patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({name: 'wdnmd'})
        .expect(200)
    const user = await User.findById(userOneID)
    expect(user.name).toEqual('wdnmd')
})

test('Should not update information out of user fields', async()=>{
    await request(app).patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({location: 'shanghai'})
        .expect(400)
})


// User Test Ideas Extra

// Should not signup user with invalid name/email/password
test('Should not signup user with invalid name/email/password', async()=>{
    await request(app).post('/users').send({
        name: 'ZJ',
        email: 'cccaaa.com',
        password: '12345678'
    }).expect(400)
    
    await request(app).post('/users').send({
        name: {name: 'wdnmd'},
        email: 'cccaaa.com',
        password: '12345678'
    }).expect(400)

    await request(app).post('/users').send({
        name: 'ZJ',
        email: 'cccaaa.com',
        password: 'password'
    }).expect(400)
    
})

// Should not update user if unauthenticated
test('Should not update user if unauthenticated', async()=>{
    await request(app).patch('/users/me')
        .send({name: 'wdnmd'})
        .expect(401)
})

// Should not update user with invalid name/email/password
test('Should not update user with invalid name/email/password', async()=>{
    await request(app).patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({email: 'google.com'})
        .expect(400)

    await request(app).patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({password: 'das'})
        .expect(400)

    await request(app).patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({name: {num: 123}})
        .expect(400)
})

