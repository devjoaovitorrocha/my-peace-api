"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const dotenv = __importStar(require("dotenv"));
const PsychologistController_1 = __importDefault(require("./controllers/PsychologistController"));
const PacientController_1 = __importDefault(require("./controllers/PacientController"));
const AuthController_1 = __importDefault(require("./controllers/AuthController"));
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use(urlencoded())
const port = process.env.PORT;
//==========================PSYCHOLOGIST============================
app.post('/register/psychologist', PsychologistController_1.default.register);
//============================PACIENT===============================
app.post('/register/pacient', PacientController_1.default.register);
//=============================LOGIN================================
app.post('/auth/login', AuthController_1.default.login);
//===========================AUTH================================
app.get('/auth/:id', AuthController_1.default.checkToken);
//==============================SERVER=============================
app.get('/', (req, res) => {
    (0, db_1.connectToDatabase)().then(() => {
        res.status(200).json({
            msg: 'everything is on...'
        });
    });
});
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map