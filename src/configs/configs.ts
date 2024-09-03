import dotenv from "dotenv";

dotenv.config()

class Configs {

    public host = process.env.EMAIL_HOST;
    public port = 587;
    public user = process.env.EMAIL_USER;
    public password = process.env.EMAIL_PASSWORD;
}

export default new Configs;