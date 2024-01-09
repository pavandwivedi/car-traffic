import express from 'express';
import { insertAchievementController, retrieveAchievementController,  } from '../controllers/achievement.controller.js';
import { checkUserLogin } from '../middlewares/user.middleware.js';

const achievmentRouter = express.Router();

achievmentRouter.post("/insert",checkUserLogin,insertAchievementController);
achievmentRouter.get("/retrieve",checkUserLogin,retrieveAchievementController);
// achievmentRouter.put("/update",checkUserLogin,updateAchievementController);

export default achievmentRouter;

