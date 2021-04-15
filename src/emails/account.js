const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'nickcheng95@gmail.com',
        subject: 'Welcome to Task App',
        text: `Welcome to Task App, ${name}. Let's start!`
    })
}

const sendCancelationEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'nickcheng95@gmail.com',
        subject: 'Thank you for using Task App',
        text: `Thank you for using Task App, ${name}. Let me how we can improve our app!`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}