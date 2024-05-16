import * as nodemailer from 'nodemailer';

export const mailSender = async (email:string , title:string, body:any) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
        

        let info = await transporter.sendMail({
            from: 'Project Management by NodeJS team',
            to: email,
            subject: title,
            html: body,
        });
        console.log(info);
        return info; 
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

