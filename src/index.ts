import express, { Request, Response } from 'express'
import { connectToDatabase } from './db'
import * as dotenv from "dotenv";
import PsychologistConttroller from './controllers/PsychologistController';
import PacientController from './controllers/PacientController';
import AuthController from './controllers/AuthController';
import ReportController from './controllers/ReportController';
import cors from 'cors'

dotenv.config()
const app = express()
app.use(express.json())
const port = process.env.PORT

const options: cors.CorsOptions = {
    methods: "GET,OPTIONS,POST,PUT,DELETE",
    origin: "http://localhost:573",
    credentials: true,
    allowedHeaders: "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
}

app.use(cors(options))

connectToDatabase().then(() => {
    //==========================PSYCHOLOGIST============================

    app.post('/register/psychologist', PsychologistConttroller.register)
    app.get('/get/psychologistInfo/:idUser', AuthController.checkToken , PsychologistConttroller.getInfo)

    //============================PACIENT===============================

    app.post('/register/pacient/:idUser', AuthController.checkToken ,PacientController.register)
    app.get('/get/pacientInfo/:idUser', AuthController.checkToken , PacientController.getInfo)

    //============================REPORT================================

    app.post('/register/report/:idUser', AuthController.checkToken , ReportController.register)
    app.post('/update/report/:idUser/:idReport', AuthController.checkToken , ReportController.update)
    app.post('/delete/report/:idUser/:idReport', AuthController.checkToken , ReportController.delete)

    //=============================LOGIN================================

    app.post('/auth/login', AuthController.login)

    //===========================AUTH================================

    app.get('/auth/:id', AuthController.checkToken)

    //==============================SERVER=============================

    app.get('/', (req: Request, res: Response) => {
        res.status(200).json({
            msg: 'everything is on...'
        })
    })

    app.listen(port, () => {
        return console.log(`Server is listening on ${port}`)
    })

}).catch((e: Error) => {
    console.log('Database connection failed...')
})