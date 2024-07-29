import { Request, Response } from "express";
import { collections } from "../db";
import bcrypt from 'bcrypt'
import { ObjectId } from "mongodb";

export default new class PacientController{

    async register(req: Request, res: Response){
        try{
            const {name, email, idPsychologist} = req.body
            const objectId = new ObjectId(idPsychologist)

            //Validations

            if(!name || !email || !idPsychologist){
                return res.status(422).json({ msg: "something is null..."})
            }

            const psychologistExists = await collections.psychologists.find({ _id: objectId }).toArray()

            if(!psychologistExists[0]){
                return res.status(422).json({ msg: "this psychologist does not exist" })
            }

            const pacientExists = await collections.pacients.find({ email: email, idPsychologist: idPsychologist }).toArray()

            if(pacientExists[0]){
                return res.status(422).json({ msg: "this pacient is already registered for this psychologist" })
            }

            const emailExistsPsychologists = await collections.psychologists.find({ email: email }).toArray()
            const emailExistsPacients = await collections.pacients.find({ email: email }).toArray()

            if(emailExistsPsychologists[0] || emailExistsPacients[0]){
                return res.status(422).json({ msg: "this email is already in use" })
            }

            const password = Math.random().toString(36).slice(-10)
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            try{
                collections.pacients.insertOne({
                    name,
                    email, 
                    password: passwordHash,
                    idPsychologist
                }).then(() =>{
                    res.status(201).json({ msg: "Pacient registered", password: password})
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
            const {name, email, idPsychologist} = req.body
            const objectId = new ObjectId(idPsychologist)

            //Validations

            if(!name || !email || !idPsychologist){
                return res.status(422).json({ msg: "something is null..."})
            }

            const psychologistExists = await collections.psychologists.find({ _id: objectId }).toArray()

            if(!psychologistExists[0]){
                return res.status(422).json({ msg: "this psychologist does not exist" })
            }

            
            const idPacient = req.params.idUser
            const objectIdPacient = new ObjectId(idPacient)

            
            const pacientExists = await collections.pacients.findOne({_id: objectIdPacient})

            if(!pacientExists){
                return res.status(422).json({ msg: "this pacient does not exist" })
            }

            const emailExistsPsychologists = await collections.psychologists.find({ email: email }).toArray()
            const emailExistsPacients = await collections.pacients.find({ email: email, _id: { $ne: objectIdPacient } }).toArray()

            if(emailExistsPsychologists[0] || emailExistsPacients[0]){
                return res.status(422).json({ msg: "this email is already in use" })
            }

            try{
                collections.pacients.updateOne({_id: objectIdPacient}, {
                    name: name,
                    email: email
                }).then((pacient) =>{
                    res.status(201).json({ msg: "Pacient edited", pacient})
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
            const idPacient = req.params.idUser
            const objectId = new ObjectId(idPacient)

            collections.pacients.deleteOne({_id: objectId}).then(() => {
                return res.status(200).json({ msg: "Pacient deleted"})
            })
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }

    async getInfo(req:Request, res:Response){
        try{
            const idPacient = req.params.idUser
            const objectId = new ObjectId(idPacient)

            collections.pacients.findOne({_id: objectId}, {projection: {password: 0, idPsychologist: 0}}).then((pacientInfo) => {
                return res.status(200).send(pacientInfo)
            })
        }catch(err){
            res.status(500).json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }

    async allPacients(req: Request, res: Response){
        try{
            const idPsychologist = req.params.idUser

            if(!idPsychologist){
                return res.status(422).json({ msg: "something is null..."})
            }

            collections.pacients.find({idPsychologist}, {projection: {password: 0, idPsychologist: 0}}).toArray().then((allPacients) => {
                return res.status(200).json({ allPacients })
            })
    
        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }
}
