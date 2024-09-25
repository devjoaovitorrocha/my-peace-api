import { Request, Response } from "express";
import { collections, connectToDatabase } from "../db";
import bcrypt from 'bcrypt'
import { GridFSBucket, ObjectId } from "mongodb";
import Mail from "../services/mail";


let gfs: GridFSBucket;

connectToDatabase().then((connection) => {
    gfs = new GridFSBucket(connection, { bucketName: 'photos' });
});


export default new class PsychologistConttroller{

    async register(req: Request, res: Response){
        try{
            const {name, cpf, registerNumber, email, password, confirmPassword} = req.body

            //Validations

            if(!name || !email || !password || !confirmPassword || !cpf || !registerNumber){
                return res.status(422).json({ msg: "something is null..."})
            }

            if(password != confirmPassword){
                return res.status(422).json({ msg: "the passwords doesn't match"  })
            }

            const psychologistExists = await collections.psychologists.find({ cpf: cpf }).toArray()

            if(psychologistExists[0]){
                return res.status(422).json({ msg: "this psychologist is already registered" })
            }

            const emailExistsPsychologists = await collections.psychologists.find({ email: email }).toArray()
            const emailExistsPacients = await collections.pacients.find({ email: email }).toArray()

            if(emailExistsPsychologists[0] || emailExistsPacients[0]){
                return res.status(422).json({ msg: "this email is already in use" })
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            const verifyCode = Math.floor(Math.random() * 10000).toString();
            const verifyCodeHash = await bcrypt.hash(verifyCode, salt)

            Mail.to = email
            Mail.message = `Olá, sua conta foi criada na nossa plataforma e o seu código de verificação é "${verifyCode}"`
            Mail.subject = `MyPeace Cadastro`

            try{
                collections.psychologists.insertOne({
                    name,
                    photo: '', 
                    cpf, 
                    registerNumber,
                    email, 
                    password: passwordHash,
                    verifyCode: verifyCodeHash,
                    verified: false
                }).then(() =>{
                    res.status(201).json({ msg: "Psychologist registered"})
                })

            } catch(err){

                console.log(err)

                res.status(500).json({ msg: "Server error, contact the support"})
            }  
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }

    async edit(req: Request, res: Response){
        try{
            const {name, cpf, registerNumber, email} = req.body

            //Validations

            if(!name || !cpf || !registerNumber ){
                return res.status(422).json({ msg: "something is null..."})
            }
            
            const idPsychologist = req.params.idUser
            const objectIdPsychologist = new ObjectId(idPsychologist)
            
            const psychologistExists = await collections.psychologists.findOne({_id: objectIdPsychologist})

            if(!psychologistExists){
                return res.status(422).json({ msg: "this psychologist does not exist" })
            }

            const emailExistPacient = await collections.pacients.find({ email: email }).toArray()
            const emailExistsPsychologist = await collections.psychologists.find({ email: email, _id: { $ne: objectIdPsychologist } }).toArray()

            if(emailExistPacient[0] || emailExistsPsychologist[0]){
                return res.status(422).json({ msg: "this email is already in use" })
            }

            try{
                collections.psychologists.updateOne({_id: objectIdPsychologist}, { $set: {   
                    "name": name,
                    "cpf": cpf,
                    "registerNumber": registerNumber,
                    "email": email,
                }}).then(() =>{
                    res.status(201).json({ msg: "Psychologist updated"})
                })

            } catch(err){

                console.log(err)

                res.status(500).json({ msg: "Server error, contact the support"})
            }  
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }
    
    async editPassword(req: Request, res: Response){
        try{
            const {currentPassword, newPassword, confirmPassword} = req.body

            //Validations

            if(!currentPassword || !newPassword || !confirmPassword ){
                return res.status(422).json({ msg: "something is null..."})
            }
            
            const idPsychologist = req.params.idUser
            const objectIdPsychologist = new ObjectId(idPsychologist)
            
            const psychologistExists = await collections.psychologists.findOne({_id: objectIdPsychologist})

            if(!psychologistExists){
                return res.status(422).json({ msg: "this pacient does not exist" })
            }


            const decryptedPassword: boolean = await bcrypt.compare(currentPassword, psychologistExists.password)
            if(!decryptedPassword){
                return res.status(422).json({msg: "the current password is incorrect"})
            }

            if(newPassword != confirmPassword){
                return res.status(422).json({msg: "the passwords dont match"})
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(newPassword, salt)

            try{
                collections.psychologists.updateOne({_id: objectIdPsychologist}, { $set: {   
                    "password": passwordHash
                }}).then(() =>{
                    res.status(201).json({ msg: "Password updated"})
                })

            } catch(err){

                console.log(err)

                res.status(500).json({ msg: "Server error, contact the support"})
            }  
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }

    async delete(req:Request, res:Response){
        try{
            const idPsychologist = req.params.idUser
            const objectId = new ObjectId(idPsychologist)

            const psychologist = await collections.psychologists.find({_id: objectId}).toArray()
            const files = await gfs.find({ filename: psychologist[0].photo }).toArray()
            await gfs.delete(files[0]._id)

            collections.psychologists.deleteOne({_id: objectId}).then(() => {
                return res.status(200).json({ msg: "Psychologist deleted"})
            })

            const pacients = await collections.pacients.find({idPsychologist: idPsychologist}).toArray()

            pacients.map(async (pacient) => {
                const files = await gfs.find({ filename: pacient.photo }).toArray()
                await gfs.delete(files[0]._id)
            })

            collections.pacients.deleteMany({idPsychologist: idPsychologist})
            
            collections.reports.deleteMany({idPsychologist: idPsychologist})
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }

    async getInfo(req:Request, res:Response){
        try{
            const idPschologist = req.params.idUser
            const objectId = new ObjectId(idPschologist)

            collections.psychologists.findOne({_id: objectId}, {projection: {password: 0, _id: 0}}).then((psychologistInfo) => {
                res.status(200).json(psychologistInfo)
            })
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }
}