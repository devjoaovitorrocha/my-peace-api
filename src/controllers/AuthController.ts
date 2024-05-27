import { NextFunction, Request, Response } from "express";
import { collections } from "../db";
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongodb";

const auth = {
    secret: String(process.env.SECRET),
    expires: '1h',
};
  

export default new class AuthController{

    async login(req: Request, res: Response){
        try{
            const {email, password} = req.body

            const psychologistInfo = await collections.psychologists.find({ email: email }).toArray()
            const pacientInfo = await collections.pacients.find({ email: email }).toArray()

            if(!psychologistInfo[0] && !pacientInfo[0]){
                return res.status(422).json({ msg: "user not found" })
            }

                if(psychologistInfo[0]){
                    const match = await bcrypt.compare(password, psychologistInfo[0].password);

                    if(match){
                        const token = await jwt.sign(
                            {
                            _id: psychologistInfo[0]._id,
                            name: psychologistInfo[0].name,
                            cpf: psychologistInfo[0].cpf,
                            registerNumber: psychologistInfo[0].registerNumber,
                            email: psychologistInfo[0].email
                            },
                            auth.secret,
                            {
                            expiresIn: auth.expires,
                            }
                        );

                        res.status(200).json({token: token, id: psychologistInfo[0]._id, type: 'psychologist'})

                    } else {
                        res.status(401).json({ msg: "Invalid Credentials" });
                    }
                }else{
                    const match = await bcrypt.compare(password, pacientInfo[0].password);

                    if(match){
                        const token = await jwt.sign(
                            {
                            _id: pacientInfo[0]._id,
                            name: pacientInfo[0].name,
                            email: pacientInfo[0].email
                            },
                            auth.secret,
                            {
                            expiresIn: auth.expires,
                            }
                        );

                        res.status(200).json({token: token, id: pacientInfo[0]._id, type: 'pacient'})

                    } else {
                        res.json({ msg: "Invalid Credentials" });
                    }
                }
        } catch(e) {
            res.status(500).json({
                msg: 'something is wrong...'
            })
            console.log(e)
        }
    }

    async checkToken(req: Request, res: Response, next: NextFunction){
        try{
            const id = req.params.idUser
            const objectId = new ObjectId(id)
            let user

            const psychologistInfo = await collections.psychologists.find({ _id: objectId }).toArray()
            const pacientInfo = await collections.pacients.find({ _id: objectId }).toArray()

            if(!psychologistInfo[0]){
                if(!pacientInfo[0]){
                    return res.status(422).json({ msg: "user not found" })
                }else{
                    user = pacientInfo[0]
                }
            }else{
                user = psychologistInfo[0]
            }

            try{
                const token = req.header('Authorization')?.replace('Bearer ', '');

                if (!token){
                    return res.status(401).json({ msg: 'No token provided.' });
                } 

                let decoded

                if(typeof(jwt.verify(token, auth.secret)) == String.prototype){
                    decoded = JSON.parse(jwt.verify(token, auth.secret).toString())
                }else{
                    decoded = jwt.verify(token, auth.secret)
                }

                
                if(user._id == decoded._id){
                    next()
                }else{
                    return res.status(401).json({msg: 'user unauthorized'});
                }

            }catch(e){
                console.log(e)
                res.status(401).json({ msg: "invalid token" })
            }
        }catch(e){

            res.status(401).json({
                msg: "something is wrong..."
            })

        }
            
    }
}