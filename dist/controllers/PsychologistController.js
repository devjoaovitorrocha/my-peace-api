"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongodb_1 = require("mongodb");
const mail_1 = __importDefault(require("../services/mail"));
let gfs;
(0, db_1.connectToDatabase)().then((connection) => {
    gfs = new mongodb_1.GridFSBucket(connection, { bucketName: 'photos' });
});
exports.default = new class PsychologistConttroller {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, cpf, registerNumber, email, password, confirmPassword } = req.body;
                //Validations
                if (!name || !email || !password || !confirmPassword || !cpf || !registerNumber) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                if (password != confirmPassword) {
                    return res.status(422).json({ msg: "the passwords doesn't match" });
                }
                const psychologistExists = yield db_1.collections.psychologists.find({ cpf: cpf }).toArray();
                if (psychologistExists[0]) {
                    return res.status(422).json({ msg: "this psychologist is already registered" });
                }
                const emailExistsPsychologists = yield db_1.collections.psychologists.find({ email: email }).toArray();
                const emailExistsPacients = yield db_1.collections.pacients.find({ email: email }).toArray();
                if (emailExistsPsychologists[0] || emailExistsPacients[0]) {
                    return res.status(422).json({ msg: "this email is already in use" });
                }
                const salt = yield bcrypt_1.default.genSalt(12);
                const passwordHash = yield bcrypt_1.default.hash(password, salt);
                const verifyCode = Math.floor(Math.random() * 10000).toString();
                const verifyCodeHash = yield bcrypt_1.default.hash(verifyCode, salt);
                mail_1.default.to = email;
                mail_1.default.message = `Olá, sua conta foi criada na nossa plataforma e o seu código de verificação é "${verifyCode}"`;
                mail_1.default.subject = `MyPeace Cadastro`;
                try {
                    db_1.collections.psychologists.insertOne({
                        name,
                        photo: '',
                        cpf,
                        registerNumber,
                        email,
                        password: passwordHash,
                        verifyCode: verifyCodeHash,
                        verified: false
                    }).then(() => {
                        res.status(201).json({ msg: "Psychologist registered" });
                    });
                }
                catch (err) {
                    console.log(err);
                    res.status(500).json({ msg: "Server error, contact the support" });
                }
            }
            catch (err) {
                res.status(500).json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
    edit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, cpf, registerNumber, email } = req.body;
                //Validations
                if (!name || !cpf || !registerNumber) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const idPsychologist = req.params.idUser;
                const objectIdPsychologist = new mongodb_1.ObjectId(idPsychologist);
                const psychologistExists = yield db_1.collections.psychologists.findOne({ _id: objectIdPsychologist });
                if (!psychologistExists) {
                    return res.status(422).json({ msg: "this psychologist does not exist" });
                }
                const emailExistPacient = yield db_1.collections.pacients.find({ email: email }).toArray();
                const emailExistsPsychologist = yield db_1.collections.psychologists.find({ email: email, _id: { $ne: objectIdPsychologist } }).toArray();
                if (emailExistPacient[0] || emailExistsPsychologist[0]) {
                    return res.status(422).json({ msg: "this email is already in use" });
                }
                try {
                    db_1.collections.psychologists.updateOne({ _id: objectIdPsychologist }, { $set: {
                            "name": name,
                            "cpf": cpf,
                            "registerNumber": registerNumber,
                            "email": email,
                        } }).then(() => {
                        res.status(201).json({ msg: "Psychologist updated" });
                    });
                }
                catch (err) {
                    console.log(err);
                    res.status(500).json({ msg: "Server error, contact the support" });
                }
            }
            catch (err) {
                res.status(500).json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
    editPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { currentPassword, newPassword, confirmPassword } = req.body;
                //Validations
                if (!currentPassword || !newPassword || !confirmPassword) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const idPsychologist = req.params.idUser;
                const objectIdPsychologist = new mongodb_1.ObjectId(idPsychologist);
                const psychologistExists = yield db_1.collections.psychologists.findOne({ _id: objectIdPsychologist });
                if (!psychologistExists) {
                    return res.status(422).json({ msg: "this pacient does not exist" });
                }
                const decryptedPassword = yield bcrypt_1.default.compare(currentPassword, psychologistExists.password);
                if (!decryptedPassword) {
                    return res.status(422).json({ msg: "the current password is incorrect" });
                }
                if (newPassword != confirmPassword) {
                    return res.status(422).json({ msg: "the passwords dont match" });
                }
                const salt = yield bcrypt_1.default.genSalt(12);
                const passwordHash = yield bcrypt_1.default.hash(newPassword, salt);
                try {
                    db_1.collections.psychologists.updateOne({ _id: objectIdPsychologist }, { $set: {
                            "password": passwordHash
                        } }).then(() => {
                        res.status(201).json({ msg: "Password updated" });
                    });
                }
                catch (err) {
                    console.log(err);
                    res.status(500).json({ msg: "Server error, contact the support" });
                }
            }
            catch (err) {
                res.status(500).json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idPsychologist = req.params.idUser;
                const objectId = new mongodb_1.ObjectId(idPsychologist);
                const psychologist = yield db_1.collections.psychologists.find({ _id: objectId }).toArray();
                const files = yield gfs.find({ filename: psychologist[0].photo }).toArray();
                yield gfs.delete(files[0]._id);
                db_1.collections.psychologists.deleteOne({ _id: objectId }).then(() => {
                    return res.status(200).json({ msg: "Psychologist deleted" });
                });
                const pacients = yield db_1.collections.pacients.find({ idPsychologist: idPsychologist }).toArray();
                pacients.map((pacient) => __awaiter(this, void 0, void 0, function* () {
                    const files = yield gfs.find({ filename: pacient.photo }).toArray();
                    yield gfs.delete(files[0]._id);
                }));
                db_1.collections.pacients.deleteMany({ idPsychologist: idPsychologist });
                db_1.collections.reports.deleteMany({ idPsychologist: idPsychologist });
            }
            catch (err) {
                res.status(500).json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
    getInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idPschologist = req.params.idUser;
                const objectId = new mongodb_1.ObjectId(idPschologist);
                db_1.collections.psychologists.findOne({ _id: objectId }, { projection: { password: 0, _id: 0 } }).then((psychologistInfo) => {
                    res.status(200).json(psychologistInfo);
                });
            }
            catch (err) {
                res.status(500).json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
};
//# sourceMappingURL=PsychologistController.js.map