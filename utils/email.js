const nodemailer = require('nodemailer');

const sendEmail = async options => {
    try{
        //CREATE EMAIL TRANSPORTER USING MAILTRAP AS FAKE MAILING SERVICE

        const transporte = nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,

        auth:{

            user: process.env.EMAIL_ADRESS,
            pass: process.env.EMAIL_PASSWORD

            },

        });

        //CREATE EMAIL OPTIONS

        const mailOptions ={
            from: 'jesus costa <jcostagalvez@gmail.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
        };
        //SEND THE EMAIL

        await transporte.sendMail(mailOptions);
        

    }catch(err){
        
        console.log(err);
    }
}

module.exports = sendEmail;