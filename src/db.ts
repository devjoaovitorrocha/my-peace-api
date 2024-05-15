// External Dependencies

import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// Global Variables

export const collections: { psychologists?: mongoDB.Collection, pacients?: mongoDB.Collection, reports?: mongoDB.Collection, } = {}

// Initialize Connection

export async function connectToDatabase () {
    dotenv.config();
 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
            
    await client.connect();
        
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
   
    const psychologistsCollection: mongoDB.Collection = db.collection("psychologists");
    const pacientsCollection: mongoDB.Collection = db.collection("pacients");
    const reportsCollection: mongoDB.Collection = db.collection("reports");
 
    collections.psychologists = psychologistsCollection;
    collections.pacients = pacientsCollection;
    collections.reports = reportsCollection;
       
    console.log(`Successfully connected to database and collections...`);
 }
