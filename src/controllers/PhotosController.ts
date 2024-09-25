import express, { Request, Response } from 'express';
import path from 'path';
import * as mongoDB from 'mongodb';
import { collections, connectToDatabase } from '../db';
import { GridFSBucket, ObjectId } from 'mongodb';
import crypto from 'crypto';
import { Readable } from 'stream';

let gfs: GridFSBucket;

connectToDatabase().then((connection) => {
    gfs = new GridFSBucket(connection, { bucketName: 'photos' });
});

class PhotosController{

    async upload(req: Request, res: Response) {
        const { userType } = req.body;
        const userId = req.params.idUser;

        // Validate the userId format
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        const objectId = new ObjectId(userId);

        try {
            // Check if a file was uploaded
            if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
            }

            // Generate a unique filename
            const fileName = `photo_${crypto.randomBytes(16).toString('hex')}${path.extname(req.file.originalname)}`;

            // Convert buffer to Readable stream for GridFS
            const readableStream = Readable.from(req.file.buffer);

            // Remove the existing file associated with this user, if any
            const existingFiles = await gfs.find({ 'metadata.fk_iduser': objectId }).toArray();
            if (existingFiles.length > 0) {
                await gfs.delete(existingFiles[0]._id);
            }

            // Save the new file to GridFS with metadata (including fk_iduser)
            const uploadStream = gfs.openUploadStream(fileName, {
            contentType: req.file.mimetype,
            metadata: {
                fk_iduser: objectId,  // Add fk_iduser in metadata
                userType: userType    // Optional: store userType as well if needed
            }
            });

            readableStream.pipe(uploadStream)
            .on('error', (error) => {
                return res.status(500).json({ message: 'Photo upload failed', error });
            })
            .on('finish', async () => {
                // Update the user profile with the new photo filename
                if (userType === 'psychologist') {
                const update = await collections.psychologists.updateOne(
                    { _id: objectId },
                    { $set: { 'photo_name': fileName } }
                );

                if (!update) {
                    return res.status(500).json({ msg: 'Server error during update' });
                }
                } else if (userType === 'pacient') {
                const update = await collections.pacients.updateOne(
                    { _id: objectId },
                    { $set: { 'photo_name': fileName } }
                );

                if (!update) {
                    return res.status(500).json({ msg: 'Server error during update' });
                }
                }

                // Return success response
                return res.status(201).json({ message: 'Photo uploaded successfully', fileName });
            });
        } catch (err) {
            res.status(500).json({ msg: 'Server error', error: err });
        }
    }


    // Route to retrieve a file by filename
    async get(req: Request, res: Response){

        try{
            const fileName = req.params.photoName;
            
        
            const files = await  gfs.find({ filename: fileName }).toArray()

            if (!files || files.length === 0) {
                return res.status(404).json({ message: 'Photo not found' });
            }
        
            const file = files[0];
        
            if (file.contentType.includes('image')) {
                // Stream the file from GridFS to the client
                gfs.openDownloadStreamByName(fileName).pipe(res);
            } else {
                return res.status(400).json({ message: 'Not an image file' });
            }
        }catch(err){
            return res.status(500).json({msg: 'server error'})
        }
    };

    async delete(req: Request, res: Response){
        const { userType } = req.body
        const  userId = req.params.photoName
        const objectId = new mongoDB.ObjectId(userId)

        try{
            const fileName = req.params.photoName;

            const files = await gfs.find({ filename: fileName }).toArray()

            if (!files || files.length === 0) {
                return res.status(404).json({ message: 'Photo not found' });
            }

            await gfs.delete(files[0]._id)

            if(userType == 'psychologist'){
                const update = await collections.psychologists.updateOne({
                    _id: objectId
                },{
                    $set: { photo_name: '' }
                })

                if(!update){
                    return res.status(500).json({msg: 'server error'})
                }
            }else if(userType == 'pacient'){
                const update = await collections.pacients.updateOne({
                    _id: objectId
                },{
                    $set: { photo_name: '' }
                })

                if(!update){
                    return res.status(500).json({msg: 'server error'})
                }
            }

            res.status(200).json({ message: 'Photo deleted successfully' });
        
        }catch(err){
            return res.status(500).json({msg: 'server error'})
        }
    };
}



export default new PhotosController()