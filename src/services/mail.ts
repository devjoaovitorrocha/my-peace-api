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
            let erro: any = 'oi'

            transporter.verify( (error, sucess) => {
                if (error) {
                    erro = error;
                } else {
                    erro = "Server is ready to take our messages";
                }
            });

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    erro = error;
                } else {
                    erro = "E-mail enviado com sucesso!";
                }
            });

            return erro

        }catch(e){
            return e
        }



        
    }
}

export default new Mail;