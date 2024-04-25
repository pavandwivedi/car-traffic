import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import userRouter from './src/routers/user.router.js';
import adminRouter from './src/routers/admin.router.js';
import levelRouter from './src/routers/level.router.js';
import achievementRouter from './src/routers/achievement.router.js';
import challengeRouter from './src/routers/user.challenge.router.js';
import { dbConfig } from './src/config/db.config.js';
import cors from 'cors';
import versionRouter from './src/routers/versionRouter.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
app.use(morgan('common'));

app.use("/user",userRouter);
app.use("/admin",adminRouter);
app.use("/level",levelRouter);
app.use("/achievement",achievementRouter);
app.use("/version",versionRouter);
app.use("/challenge",challengeRouter);

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    dbConfig();
    console.log(`Server : http://localhost:${port}`);
})