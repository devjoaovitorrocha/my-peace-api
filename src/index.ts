import express, { Request, Response, urlencoded } from 'express'
import { connectToDatabase } from './db'
import * as dotenv from "dotenv";
import PsychologistConttroller from './controllers/PsychologistController';
import { json } from 'stream/consumers';

dotenv.config()
const app = express()
app.use(express.json())
// app.use(urlencoded())
const port = process.env.PORT

app.get('/ping', (req: Request, res: Response) => {
    res.json({msg: 'pong'})
})

//==========================PSYCHOLOGIST============================

app.post('/register/psychologist', PsychologistConttroller.register)

app.get('/', (req, res) => {
    res.status(200).json({
        msg: 'everything is on...'
    })
})

app.listen(port, () => {
    connectToDatabase().then(() => {
        return console.log(`Server is listening on ${port}`)
    })
})
