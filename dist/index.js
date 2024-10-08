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
const ReportController_1 = __importDefault(require("./controllers/ReportController"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const PhotosController_1 = __importDefault(require("./controllers/PhotosController"));
const ReportPsychologistController_1 = __importDefault(require("./controllers/ReportPsychologistController"));
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT;
const options = {
    methods: "GET,OPTIONS,POST,PUT,DELETE",
    origin: "*",
    credentials: true,
    allowedHeaders: "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
};
app.use((0, cors_1.default)(options));
(0, db_1.connectToDatabase)().then(() => {
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({ storage });
    //==========================PHOTOS============================
    app.post('/upload/photo/:idUser', AuthController_1.default.checkToken, upload.single('photo'), PhotosController_1.default.upload);
    app.get('/get/photo/:idUser/:photoName', AuthController_1.default.checkToken, PhotosController_1.default.get);
    app.post('/delete/photo/:idUser/:photoName', AuthController_1.default.checkToken, PhotosController_1.default.delete);
    //==========================PSYCHOLOGIST============================
    app.post('/register/psychologist', PsychologistController_1.default.register);
    app.post('/update/psychologists/:idUser', AuthController_1.default.checkToken, PsychologistController_1.default.edit);
    app.post('/update/password/psychologist/:idUser', AuthController_1.default.checkToken, PsychologistController_1.default.editPassword);
    app.post('/delete/psychologists/:idUser', AuthController_1.default.checkToken, PsychologistController_1.default.delete);
    app.get('/get/psychologistInfo/:idUser', AuthController_1.default.checkToken, PsychologistController_1.default.getInfo);
    //============================PACIENT===============================
    app.post('/register/pacient/:idUser', AuthController_1.default.checkToken, PacientController_1.default.register);
    app.get('/get/pacientInfo/:idUser', AuthController_1.default.checkToken, PacientController_1.default.getInfo);
    app.get('/getAll/pacients/:idUser', AuthController_1.default.checkToken, PacientController_1.default.allPacients);
    app.post('/delete/pacients/:idUser', AuthController_1.default.checkToken, PacientController_1.default.delete);
    app.post('/update/pacients/:idUser', AuthController_1.default.checkToken, PacientController_1.default.edit);
    app.post('/update/password/pacients/:idUser', AuthController_1.default.checkToken, PacientController_1.default.editPassword);
    //============================REPORT================================
    app.post('/register/report/:idUser', AuthController_1.default.checkToken, ReportController_1.default.register);
    app.post('/update/report/:idUser/:idReport', AuthController_1.default.checkToken, ReportController_1.default.update);
    app.post('/delete/report/:idUser/:idReport', AuthController_1.default.checkToken, ReportController_1.default.delete);
    app.get('/getAll/reports/:idUser', AuthController_1.default.checkToken, ReportController_1.default.allReports);
    //============================REPORT PSYCHOLOGIST================================
    app.post('/register/report/psychologist/:idUser/:idPacient', AuthController_1.default.checkToken, ReportPsychologistController_1.default.register);
    app.post('/update/report/psychologist/:idUser/:idReport', AuthController_1.default.checkToken, ReportPsychologistController_1.default.update);
    app.post('/delete/report/psychologist/:idUser/:idReport', AuthController_1.default.checkToken, ReportPsychologistController_1.default.delete);
    app.get('/getAll/reports/psychologist/pacient/:idUser', AuthController_1.default.checkToken, ReportPsychologistController_1.default.allReportsPacient);
    app.get('/getAll/reports/psychologist/:idUser', AuthController_1.default.checkToken, ReportPsychologistController_1.default.allReportsPsychologist);
    //=============================AUTH================================
    app.post('/auth/login', AuthController_1.default.login);
    app.post('/auth/verifyEmail/:idUser', AuthController_1.default.checkToken, AuthController_1.default.verifyCode);
    //==============================SERVER=============================
    app.get('/', (req, res) => {
        res.status(200).json({
            msg: 'everything is on...'
        });
    });
    app.listen(port, () => {
        return console.log(`Server is listening on ${port}`);
    });
}).catch((e) => {
    console.log('Database connection failed...');
});
//# sourceMappingURL=index.js.map