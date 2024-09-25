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
const path_1 = __importDefault(require("path"));
const mongoDB = __importStar(require("mongodb"));
const db_1 = require("../db");
const mongodb_1 = require("mongodb");
const crypto_1 = __importDefault(require("crypto"));
const stream_1 = require("stream");
let gfs;
(0, db_1.connectToDatabase)().then((connection) => {
    gfs = new mongodb_1.GridFSBucket(connection, { bucketName: 'photos' });
});
class PhotosController {
    upload(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userType } = req.body;
            const userId = req.params.idUser;
            // Validate the userId format
            if (!mongodb_1.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }
            const objectId = new mongodb_1.ObjectId(userId);
            try {
                // Check if a file was uploaded
                if (!req.file) {
                    return res.status(400).json({ message: 'No photo uploaded' });
                }
                // Generate a unique filename
                const fileName = `photo_${crypto_1.default.randomBytes(16).toString('hex')}${path_1.default.extname(req.file.originalname)}`;
                // Convert buffer to Readable stream for GridFS
                const readableStream = stream_1.Readable.from(req.file.buffer);
                // Remove the existing file associated with this user, if any
                const existingFiles = yield gfs.find({ 'metadata.fk_iduser': objectId }).toArray();
                if (existingFiles.length > 0) {
                    yield gfs.delete(existingFiles[0]._id);
                }
                // Save the new file to GridFS with metadata (including fk_iduser)
                const uploadStream = gfs.openUploadStream(fileName, {
                    contentType: req.file.mimetype,
                    metadata: {
                        fk_iduser: objectId, // Add fk_iduser in metadata
                        userType: userType // Optional: store userType as well if needed
                    }
                });
                readableStream.pipe(uploadStream)
                    .on('error', (error) => {
                    return res.status(500).json({ message: 'Photo upload failed', error });
                })
                    .on('finish', () => __awaiter(this, void 0, void 0, function* () {
                    // Update the user profile with the new photo filename
                    if (userType === 'psychologist') {
                        const update = yield db_1.collections.psychologists.updateOne({ _id: objectId }, { $set: { 'photo_name': fileName } });
                        if (!update) {
                            return res.status(500).json({ msg: 'Server error during update' });
                        }
                    }
                    else if (userType === 'pacient') {
                        const update = yield db_1.collections.pacients.updateOne({ _id: objectId }, { $set: { 'photo_name': fileName } });
                        if (!update) {
                            return res.status(500).json({ msg: 'Server error during update' });
                        }
                    }
                    // Return success response
                    return res.status(201).json({ message: 'Photo uploaded successfully', fileName });
                }));
            }
            catch (err) {
                res.status(500).json({ msg: 'Server error', error: err });
            }
        });
    }
    // Route to retrieve a file by filename
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileName = req.params.photoName;
                const files = yield gfs.find({ filename: fileName }).toArray();
                if (!files || files.length === 0) {
                    return res.status(404).json({ message: 'Photo not found' });
                }
                const file = files[0];
                if (file.contentType.includes('image')) {
                    // Stream the file from GridFS to the client
                    gfs.openDownloadStreamByName(fileName).pipe(res);
                }
                else {
                    return res.status(400).json({ message: 'Not an image file' });
                }
            }
            catch (err) {
                return res.status(500).json({ msg: 'server error' });
            }
        });
    }
    ;
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userType } = req.body;
            const userId = req.params.photoName;
            const objectId = new mongoDB.ObjectId(userId);
            try {
                const fileName = req.params.photoName;
                const files = yield gfs.find({ filename: fileName }).toArray();
                if (!files || files.length === 0) {
                    return res.status(404).json({ message: 'Photo not found' });
                }
                yield gfs.delete(files[0]._id);
                if (userType == 'psychologist') {
                    const update = yield db_1.collections.psychologists.updateOne({
                        _id: objectId
                    }, {
                        $set: { photo_name: '' }
                    });
                    if (!update) {
                        return res.status(500).json({ msg: 'server error' });
                    }
                }
                else if (userType == 'pacient') {
                    const update = yield db_1.collections.pacients.updateOne({
                        _id: objectId
                    }, {
                        $set: { photo_name: '' }
                    });
                    if (!update) {
                        return res.status(500).json({ msg: 'server error' });
                    }
                }
                res.status(200).json({ message: 'Photo deleted successfully' });
            }
            catch (err) {
                return res.status(500).json({ msg: 'server error' });
            }
        });
    }
    ;
}
exports.default = new PhotosController();
//# sourceMappingURL=PhotosController.js.map