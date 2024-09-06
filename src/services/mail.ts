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
            secure: false,
            auth: {
                user: config.user,
                pass: config.password
            },
            tls: { 
                rejectUnauthorized: false 
            }
        });

        try{

            transporter.verify( (error) => {
                if (error) {
                return error;
                } else {
                console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return error;
                } else {
                    return "E-mail enviado com sucesso!";
                }
            });

        }catch(e){
            return e
        }



        
    }
}

export default new Mail;