import * as nodemailer from "nodemailer";
import config from '../configs/configs';

class Mail {

    constructor(
        public to?: string,
        public subject?: string,
        public message?: string) { }


    sendMail() {

        let mailOptions = {
            from: "projetomypeace@gmail.com",
            to: this.to,
            subject: this.subject,
            html: this.message
        };
        
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: true,
            auth: {
                user: config.user,
                pass: config.password
            },
            tls: { rejectUnauthorized: false }
        });


        transporter.sendMail(mailOptions, function (error, info) {
            console.log('oi')
            if (error) {
                console.log(error);
            } else {
                console.log("E-mail enviado com sucesso!");
            }
        });
    }
}

export default new Mail;