import express, { Request, Response } from 'express'
import { connectToDatabase } from './db'
import * as dotenv from "dotenv";
import PsychologistConttroller from './controllers/PsychologistController';
import PacientController from './controllers/PacientController';
import AuthController from './controllers/AuthController';

dotenv.config()
const app = express()
app.use(express.json())
const port = process.env.PORT

//==========================PSYCHOLOGIST============================

app.post('/register/psychologist', PsychologistConttroller.register)


//============================PACIENT===============================

app.post('/register/pacient', PacientController.register)

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
    connectToDatabase()
    return console.log(`Server is listening on ${port}`)
})
