import express, { Request, Response } from 'express'
import { connectToDatabase } from './db'
import * as dotenv from "dotenv";

dotenv.config()
const app = express()
const port = process.env.PORT

app.listen(port, () => {
    connectToDatabase().then(() => {return console.log(`Server is listening on ${port}`)})
})