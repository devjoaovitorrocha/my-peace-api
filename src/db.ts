// External Dependencies

import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();


const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
// Global Variables

export const collections: { psychologists?: mongoDB.Collection, pacients?: mongoDB.Collection, reports?: mongoDB.Collection, photosFiles?: mongoDB.Collection, photosChunks?: mongoDB.Collection, reportsPsychologist?: mongoDB.Collection} = {}

// Initialize Connection

export async function connectToDatabase () {
            
    const connection = await client.connect();
        
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
   
    const psychologistsCollection: mongoDB.Collection = db.collection("psychologists");
    const pacientsCollection: mongoDB.Collection = db.collection("pacients");
    const reportsCollection: mongoDB.Collection = db.collection("reports");
    const reportsPsychologistCollection: mongoDB.Collection = db.collection("reportsPsychologist");
    const photosFilesCollection: mongoDB.Collection = db.collection("photos.files");
    const photosChunksCollection: mongoDB.Collection = db.collection("photos.chunks");
 
    collections.psychologists = psychologistsCollection;
    collections.pacients = pacientsCollection;
    collections.reports = reportsCollection;
    collections.reportsPsychologist = reportsPsychologistCollection;
    collections.photosFiles = photosFilesCollection;
    collections.photosChunks = photosChunksCollection;

    console.log(`Successfully connected to database and collections...`);

    return db
}