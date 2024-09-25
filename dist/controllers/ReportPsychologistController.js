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
exports.default = new class ReportPsychologistController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { topics, progress, tasks, observations, challenges } = req.body;
                const idPsychologist = req.params.idUser;
                const idPacient = req.params.idPacient;
                const objectIdPsychologist = new mongodb_1.ObjectId(idPsychologist);
                const objectIdPacient = new mongodb_1.ObjectId(idPacient);
                if (!topics || !progress || !tasks || !observations || !challenges || !idPacient) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const pacientExists = yield db_1.collections.pacients.find({ _id: objectIdPacient }).toArray();
                const psychologistExists = yield db_1.collections.psychologists.find({ _id: objectIdPsychologist }).toArray();
                if (!pacientExists[0] || !psychologistExists[0]) {
                    return res.status(422).json({ msg: "this user does not exist" });
                }
                const now = new Date();
                const date = now.toLocaleDateString();
                const time = now.toLocaleTimeString();
                db_1.collections.reportsPsychologist.insertOne({
                    date,
                    time,
                    topics,
                    progress,
                    tasks,
                    observations,
                    challenges,
                    idPacient: pacientExists[0]._id,
                    idPsychologist: psychologistExists[0]._id
                }).then(() => {
                    return res.status(200).json({
                        msg: 'report registered'
                    });
                });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({
                    msg: 'something is wrong...'
                });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { topics, progress, tasks, observations, challenges } = req.body;
                const idReport = req.params.idReport;
                const objectIdReport = new mongodb_1.ObjectId(idReport);
                if (!topics || !progress || !tasks || !observations || !challenges) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const reportExists = yield db_1.collections.reportsPsychologist.find({ _id: objectIdReport }).toArray();
                if (!reportExists[0]) {
                    return res.status(422).json({ msg: "this report does not exist" });
                }
                const now = new Date();
                const date = now.toLocaleDateString();
                const time = now.toLocaleTimeString();
                db_1.collections.reportsPsychologist.updateMany({ _id: objectIdReport }, {
                    "$set": {
                        date,
                        time,
                        topics,
                        progress,
                        tasks,
                        observations,
                        challenges,
                    }
                }).then(() => {
                    return res.status(200).json({ msg: "report updated" });
                });
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
            try {
                const idReport = req.params.idReport;
                const objectIdReport = new mongodb_1.ObjectId(idReport);
                if (!idReport) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                const reportExists = yield db_1.collections.reportsPsychologist.find({ _id: objectIdReport }).toArray();
                if (!reportExists[0]) {
                    return res.status(422).json({ msg: "this report does not exist" });
                }
                db_1.collections.reportsPsychologist.deleteOne({ _id: objectIdReport }).then(() => {
                    return res.status(200).json({ msg: "report deleted" });
                });
            }
            catch (e) {
                return res.status(500).json({
                    msg: 'something is wrong...'
                });
            }
        });
    }
    allReportsPsychologist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idPacient = req.params.idUser;
                if (!idPacient) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                db_1.collections.reportsPsychologist.find({ idPacient }).toArray().then((reports) => {
                    return res.status(200).json({ reports });
                });
            }
            catch (e) {
                return res.status(500).json({
                    msg: 'something is wrong...'
                });
            }
        });
    }
    allReportsPacient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idPacient = req.params.idUser;
                if (!idPacient) {
                    return res.status(422).json({ msg: "something is null..." });
                }
                db_1.collections.reportsPsychologist.find({ idPacient }, { projection: { date: 0, time: 0, progress: 0, observations: 0 } }).toArray().then((reports) => {
                    return res.status(200).json({ reports });
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
//# sourceMappingURL=ReportPsychologistController.js.map