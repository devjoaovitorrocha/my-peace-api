import { Request, Response } from "express";
import { collections } from "../db";
import bcrypt from 'bcrypt'

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

            try{
                collections.psychologists.insertOne({
                    name, 
                    cpf, 
                    registerNumber,
                    email, 
                    password: passwordHash
                }).then(() =>{
                    res.status(201).json({ msg: "Psychologist registered"})
                })

            } catch(err){

                console.log(err)

                res.status(500).json({ msg: "Server error, contact the support"})
            }  
        }catch(err){
            res.json({msg: 'Sorry, there is something wrong...'})
            console.log(err)
        }
    }
}