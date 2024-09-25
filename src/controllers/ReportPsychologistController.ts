import { Request, Response } from "express"
import { collections } from "../db"
import { ObjectId } from "mongodb"


export default new class ReportPsychologistController{

    async register(req: Request, res: Response){
        try{
            const { topics, progress, tasks, observations, challenges } = req.body
            const idPsychologist = req.params.idUser
            const idPacient = req.params.idPacient
            const objectIdPsychologist = new ObjectId(idPsychologist)
            const objectIdPacient = new ObjectId(idPacient)

            if(!topics || !progress || !tasks || !observations || !challenges || !idPacient){
                return res.status(422).json({ msg: "something is null..."})
            }

            const pacientExists = await collections.pacients.find({ _id: objectIdPacient }).toArray()
            const psychologistExists = await collections.psychologists.find({ _id: objectIdPsychologist }).toArray()

            if(!pacientExists[0] || !psychologistExists[0]){
                return res.status(422).json({ msg: "this user does not exist" })
            }

            const now = new Date()
            const date = now.toLocaleDateString()
            const time = now.toLocaleTimeString()

            collections.reportsPsychologist.insertOne({
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
                })
            })
            
        }catch(e){
            console.log(e)
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }

    
    async update(req: Request, res: Response){
        try{
            const { topics, progress, tasks, observations, challenges } = req.body
            const idReport = req.params.idReport
            const objectIdReport = new ObjectId(idReport)

            if(!topics || !progress || !tasks || !observations || !challenges){
                return res.status(422).json({ msg: "something is null..."})
            }

            const reportExists = await collections.reportsPsychologist.find({ _id: objectIdReport }).toArray()

            if(!reportExists[0]){
                return res.status(422).json({ msg: "this report does not exist" })
            }

            const now = new Date()
            const date = now.toLocaleDateString()
            const time = now.toLocaleTimeString()

            collections.reportsPsychologist.updateMany({_id: objectIdReport},{
                "$set":{
                    date,
                    time,
                    topics,
                    progress,
                    tasks,
                    observations, 
                    challenges,
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
            const idReport = req.params.idReport
            const objectIdReport = new ObjectId(idReport)

            if(!idReport){
                return res.status(422).json({ msg: "something is null..."})
            }

            const reportExists = await collections.reportsPsychologist.find({ _id: objectIdReport }).toArray()

            if(!reportExists[0]){
                return res.status(422).json({ msg: "this report does not exist" })
            }

            collections.reportsPsychologist.deleteOne({_id: objectIdReport}).then(() => {
                return res.status(200).json({ msg: "report deleted" })
            })

        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }

    async allReportsPsychologist(req: Request, res: Response){
        try{
            const idPacient = req.params.idUser
         
            if(!idPacient){
                return res.status(422).json({ msg: "something is null..."})
            }
            collections.reportsPsychologist.find({idPacient}).toArray().then((reports) => {
                return res.status(200).json({ reports })
            })

    
        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }

    async allReportsPacient(req: Request, res: Response){
        try{
            const idPacient = req.params.idUser
         
            if(!idPacient){
                return res.status(422).json({ msg: "something is null..."})
            }
            collections.reportsPsychologist.find({idPacient}, {projection: {date: 0, time: 0, progress: 0, observations: 0}}).toArray().then((reports) => {
                return res.status(200).json({ reports })
            })

    
        }catch(e){
            return res.status(500).json({
                msg: 'something is wrong...'
            })
        }
    }
}