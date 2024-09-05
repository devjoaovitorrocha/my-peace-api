import dotenv from "dotenv";

dotenv.config()

class Configs {

    public host = process.env.EMAIL_HOST;
    public port = parseInt(process.env.EMAIL_PORT);
    public user = process.env.EMAIL_USER;
    public password = process.env.EMAIL_PASSWORD;
}

export default new Configs;