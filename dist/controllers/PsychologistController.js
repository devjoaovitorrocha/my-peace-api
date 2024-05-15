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
                try {
                    db_1.collections.psychologists.insertOne({
                        name,
                        cpf,
                        registerNumber,
                        email,
                        password: passwordHash
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
                res.json({ msg: 'Sorry, there is something wrong...' });
                console.log(err);
            }
        });
    }
};
//# sourceMappingURL=PsychologistController.js.map