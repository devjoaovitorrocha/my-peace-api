import express, { Request, Response } from 'express'
import { connectToDatabase } from './db'
import * as dotenv from "dotenv";

dotenv.config()
const app = express()
const port = process.env.PORT

let msg = ''

app.get('/', () => {
    console.log(msg)
})

app.listen(port, () => {
    connectToDatabase().then(() => {
        msg = 'server is listening and db is connected'
        return console.log(`Server is listening on ${port}`)
    })
})