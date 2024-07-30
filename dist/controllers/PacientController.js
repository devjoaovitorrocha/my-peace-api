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
exports.default = new class PacientController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, idPsychologist } = req.body;
                const objectId = new mongodb_1.ObjectId(idPsychologist);
                //Validations
                if (!name || !email || !idPsychologist) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const psychologistExists = yield db_1.collections.psychologists.find({ _id: objectId }).toArray();
                if (!psychologistExists[0]) {
                    return res.status(422).json({ msg: "this psychologist does not exist" });
                }
                const pacientExists = yield db_1.collections.pacients.find({ email: email, idPsychologist: idPsychologist }).toArray();
                if (pacientExists[0]) {
                    return res.status(422).json({ msg: "this pacient is already registered for this psychologist" });
                }
                const emailExistsPsychologists = yield db_1.collections.psychologists.find({ email: email }).toArray();
                const emailExistsPacients = yield db_1.collections.pacients.find({ email: email }).toArray();
                if (emailExistsPsychologists[0] || emailExistsPacients[0]) {
                    return res.status(422).json({ msg: "this email is already in use" });
                }
                const password = Math.random().toString(36).slice(-10);
                const salt = yield bcrypt_1.default.genSalt(12);
                const passwordHash = yield bcrypt_1.default.hash(password, salt);
                try {
                    db_1.collections.pacients.insertOne({
                        name,
                        email,
                        password: passwordHash,
                        idPsychologist
                    }).then(() => {
                        res.status(201).json({ msg: "Pacient registered", password: password });
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
                const { name, email, idPsychologist } = req.body;
                const objectId = new mongodb_1.ObjectId(idPsychologist);
                //Validations
                if (!name || !email || !idPsychologist) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const psychologistExists = yield db_1.collections.psychologists.find({ _id: objectId }).toArray();
                if (!psychologistExists[0]) {
                    return res.status(422).json({ msg: "this psychologist does not exist" });
                }
                const idPacient = req.params.idUser;
                const objectIdPacient = new mongodb_1.ObjectId(idPacient);
                const pacientExists = yield db_1.collections.pacients.findOne({ _id: objectIdPacient });
                if (!pacientExists) {
                    return res.status(422).json({ msg: "this pacient does not exist" });
                }
                const emailExistsPsychologists = yield db_1.collections.psychologists.find({ email: email }).toArray();
                const emailExistsPacients = yield db_1.collections.pacients.find({ email: email, _id: { $ne: objectIdPacient } }).toArray();
                if (emailExistsPsychologists[0] || emailExistsPacients[0]) {
                    return res.status(422).json({ msg: "this email is already in use" });
                }
                try {
                    db_1.collections.pacients.updateOne({ _id: objectIdPacient }, { $set: {
                            "name": name,
                            "email": email
                        } }).then((pacient) => {
                        res.status(201).json({ msg: "Pacient edited", pacient });
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
                const idPacient = req.params.idUser;
                const objectId = new mongodb_1.ObjectId(idPacient);
                db_1.collections.pacients.deleteOne({ _id: objectId }).then(() => {
                    return res.status(200).json({ msg: "Pacient deleted" });
                });
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
                const idPacient = req.params.idUser;
                const objectId = new mongodb_1.ObjectId(idPacient);
                db_1.collections.pacients.findOne({ _id: objectId }, { projection: { password: 0, idPsychologist: 0 } }).then((pacientInfo) => {
                    return res.status(200).send(pacientInfo);
                });
            }
            catch (err) {
                res.status(500).json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
    allPacients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idPsychologist = req.params.idUser;
                if (!idPsychologist) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                db_1.collections.pacients.find({ idPsychologist }, { projection: { password: 0, idPsychologist: 0 } }).toArray().then((allPacients) => {
                    return res.status(200).json({ allPacients });
                });
            }
            catch (e) {
                return res.status(500).json({
                    msg: 'something is wrong...'
                });
            }
        });
    }
};
//# sourceMappingURL=PacientController.js.map