import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;

export async function dbConfig(){
    try {
        const db_options={
            dbName: process.env.DBNAME,
            user: process.env.DBUSERNAME,
            pass: process.env.DBPASSWORD,
            authSource: process.env.DBAUTHSOURCE
        }
        const connect =  await mongoose.connect(url,);
        console.log("DB connected");
    } catch (err) {
        console.log(err.message);
        return err.message;
    }
}