// External Dependencies

import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// Global Variables

export const collections: { psychologists?: mongoDB.Collection, pacients?: mongoDB.Collection, reports?: mongoDB.Collection, } = {}

// Initialize Connection

export async function connectToDatabase () {
    dotenv.config();
 
    const client: mongoDB.MongoClient = new mongoDB.MongoClient("mongodb+srv://admin:98pGha2wWuB3wePE@mypeace.9ibtalu.mongodb.net/?retryWrites=true&w=majority&appName=MyPeace");
            
    await client.connect();
        
    const db: mongoDB.Db = client.db("mypeace-api");
   
    const psychologistsCollection: mongoDB.Collection = db.collection("psychologists");
    const pacientsCollection: mongoDB.Collection = db.collection("pacients");
    const reportsCollection: mongoDB.Collection = db.collection("reports");
 
    collections.psychologists = psychologistsCollection;
    collections.pacients = pacientsCollection;
    collections.psychologists = reportsCollection;
       
    console.log(`Successfully connected to database: ${db.databaseName} and collections...`);
 }
