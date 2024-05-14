import express, { Request, Response } from 'express'
import { connectToDatabase } from './db'
import * as dotenv from "dotenv";

dotenv.config()
const app = express()
const port = process.env.PORT

app.get('/', (req: Request, res: Response) => {
    connectToDatabase().then(() => {
        res.json({msg: 'Ok'})
    })
})

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`)
})
