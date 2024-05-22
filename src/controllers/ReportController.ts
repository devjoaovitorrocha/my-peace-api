import { Request, Response } from "express"
import { collections } from "../db"
import { ObjectId } from "mongodb"


export default new class ReportController{

    async register(req: Request, res: Response){
        try{
            const { feeling, description } = req.body
            const idPacient = req.params.idUser
            const objectId = new ObjectId(idPacient)

            if(!feeling || !description || !idPacient){
                return res.status(422).json({ msg: "something is null..."})
            }

            const pacientExists = await collections.pacients.find({ _id: objectId }).toArray()

            if(!pacientExists[0]){
                return res.status(422).json({ msg: "this pacient does not exist" })
            }

            const now = new Date()
            const date = now.toLocaleDateString()
            const time = now.toLocaleTimeString()

            collections.reports.insertOne({
                date,
                time,
                feeling,
                description,
                idPacient
            }).then(() => {
                return res.status(200).json({
                    msg: 'report registered'
                })
            })
            
        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
            console.log(e)
        }
    }

    
    async update(req: Request, res: Response){
        try{
            const { feeling, description } = req.body
            const idPacient = req.params.idUser
            const idReport = req.params.idReport

            const objectIdReport = new ObjectId(idReport)

            if(!feeling || !description || !idPacient || !idReport){
                return res.status(422).json({ msg: "something is null..."})
            }

            const reportExists = await collections.reports.find({ _id: objectIdReport }).toArray()

            if(!reportExists[0]){
                return res.status(422).json({ msg: "this report does not exist" })
            }

            collections.reports.updateMany({_id: objectIdReport},{
                "$set":{
                    feeling,
                    description
                }
            }).then(() => {
                return res.status(200).json({ msg: "report updated" })
            })

        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }

    async delete(req: Request, res: Response){
        try{
            const idPacient = req.params.idUser
            const idReport = req.params.idReport

            const objectIdReport = new ObjectId(idReport)

            if(!idPacient || !idReport){
                return res.status(422).json({ msg: "something is null..."})
            }

            const reportExists = await collections.reports.find({ _id: objectIdReport }).toArray()

            if(!reportExists[0]){
                return res.status(422).json({ msg: "this report does not exist" })
            }

            collections.reports.deleteOne({_id: objectIdReport}).then(() => {
                return res.status(200).json({ msg: "report deleted" })
            })

        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }
}