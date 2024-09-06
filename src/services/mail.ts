import * as nodemailer from "nodemailer";
import config from '../configs/configs';

class Mail {
    constructor(
        public to?: string,
        public subject?: string,
        public message?: string) { }

    async sendMail() {
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

        transporter.sendMail(mailOptions, function (error, info) {
            console.log('oi')
            if (error) {
                console.log(error);
            } else {
                console.log("E-mail enviado com sucesso!");
            }
        });
        try {
            await transporter.verify();

            await transporter.sendMail(mailOptions);
            
            return "E-mail enviado com sucesso!";
        } catch (error) {
            return error;
        }
    }
}

export default new Mail();