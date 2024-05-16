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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const mongodb_1 = require("mongodb");
exports.default = new class ReportController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { feeling, description } = req.body;
                const idPacient = req.params.id;
                const objectId = new mongodb_1.ObjectId(idPacient);
                if (!feeling || !description || !idPacient) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const pacientExists = yield db_1.collections.pacients.find({ _id: objectId }).toArray();
                if (!pacientExists[0]) {
                    return res.status(422).json({ msg: "this pacient does not exist" });
                }
                const now = new Date();
                const date = now.toLocaleDateString();
                const time = now.toLocaleTimeString();
                db_1.collections.reports.insertOne({
                    date,
                    time,
                    feeling,
                    description,
                    idPacient
                });
                return res.status(200).json({
                    msg: 'report registered'
                });
            }
            catch (e) {
                return res.status(500).json({
                    msg: 'something is wrong...'
                });
                console.log(e);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { feeling, description } = req.body;
                const idPacient = req.params.id;
                const idReport = req.params.idReport;
                const objectIdReport = new mongodb_1.ObjectId(idReport);
                if (!feeling || !description || !idPacient || !idReport) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const reportExists = yield db_1.collections.reports.find({ _id: objectIdReport }).toArray();
                if (!reportExists[0]) {
                    return res.status(422).json({ msg: "this report does not exist" });
                }
                db_1.collections.reports.updateMany({ _id: objectIdReport }, {
                    "$set": {
                        feeling,
                        description
                    }
                });
                return res.status(200).json({ msg: "report updated" });
            }
            catch (e) {
                return res.status(500).json({
                    msg: 'something is wrong...'
                });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
};
//# sourceMappingURL=ReportController.js.map