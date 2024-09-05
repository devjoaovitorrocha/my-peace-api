"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Configs {
    constructor() {
        this.host = 'smtp-mail.outlook.com';
        this.port = 587;
        this.user = process.env.EMAIL_USER;
        this.password = process.env.EMAIL_PASSWORD;
    }
}
exports.default = new Configs;
//# sourceMappingURL=configs.js.map