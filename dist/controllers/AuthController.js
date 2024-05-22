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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const auth = {
    secret: String(process.env.SECRET),
    expires: '1h',
};
exports.default = new class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const psychologistInfo = yield db_1.collections.psychologists.find({ email: email }).toArray();
                const pacientInfo = yield db_1.collections.pacients.find({ email: email }).toArray();
                if (!psychologistInfo[0] && !pacientInfo[0]) {
                    return res.status(422).json({ msg: "user not found" });
                }
                if (psychologistInfo[0]) {
                    const match = yield bcrypt_1.default.compare(password, psychologistInfo[0].password);
                    if (match) {
                        const token = yield jsonwebtoken_1.default.sign({
                            _id: psychologistInfo[0]._id,
                            name: psychologistInfo[0].name,
                            cpf: psychologistInfo[0].cpf,
                            registerNumber: psychologistInfo[0].registerNumber,
                            email: psychologistInfo[0].email
                        }, auth.secret, {
                            expiresIn: auth.expires,
                        });
                        res.status(200).json({ token: token, id: psychologistInfo[0]._id, type: 'psychologist' });
                    }
                    else {
                        res.json({ message: "Invalid Credentials" });
                    }
                }
                else {
                    const match = yield bcrypt_1.default.compare(password, pacientInfo[0].password);
                    if (match) {
                        const token = yield jsonwebtoken_1.default.sign({
                            _id: pacientInfo[0]._id,
                            name: pacientInfo[0].name,
                            email: pacientInfo[0].email
                        }, auth.secret, {
                            expiresIn: auth.expires,
                        });
                        res.status(200).json({ token: token, id: pacientInfo[0]._id, type: 'pacient' });
                    }
                    else {
                        res.json({ message: "Invalid Credentials" });
                    }
                }
            }
            catch (e) {
                res.status(500).json({
                    msg: 'something is wrong...'
                });
                console.log(e);
            }
        });
    }
    checkToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = req.params.idUser;
                const objectId = new mongodb_1.ObjectId(id);
                let user;
                const psychologistInfo = yield db_1.collections.psychologists.find({ _id: objectId }).toArray();
                const pacientInfo = yield db_1.collections.pacients.find({ _id: objectId }).toArray();
                if (!psychologistInfo[0]) {
                    if (!pacientInfo[0]) {
                        return res.status(422).json({ msg: "user not found" });
                    }
                    else {
                        user = pacientInfo[0];
                    }
                }
                else {
                    user = psychologistInfo[0];
                }
                try {
                    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                    if (!token) {
                        return res.status(401).json({ message: 'No token provided.' });
                    }
                    let decoded;
                    if (typeof (jsonwebtoken_1.default.verify(token, auth.secret)) == String.prototype) {
                        decoded = JSON.parse(jsonwebtoken_1.default.verify(token, auth.secret).toString());
                    }
                    else {
                        decoded = jsonwebtoken_1.default.verify(token, auth.secret);
                    }
                    if (user._id == decoded._id) {
                        next();
                    }
                    else {
                        return res.status(401).json({ msg: 'user unauthorized' });
                    }
                }
                catch (e) {
                    console.log(e);
                    res.status(401).json({ msg: "invalid token" });
                }
            }
            catch (e) {
                res.status(401).json({
                    msg: "something is wrong..."
                });
            }
        });
    }
};
//# sourceMappingURL=AuthController.js.map