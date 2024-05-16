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
}