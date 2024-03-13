import express from 'express';
import { getAllUsers, loginAdminController, signupAdminController,createChallengeController,updateChallengeController,deleteChallengeController} from '../controllers/admin.controller.js';
import { checkAdminLogin } from '../middlewares/admin.middleware.js';

const adminRouter = express.Router();

adminRouter.post("/signup",signupAdminController);
adminRouter.post("/login",loginAdminController);
adminRouter.get("/getAllUsers",checkAdminLogin,getAllUsers);
adminRouter.post('/createChallenge',checkAdminLogin,createChallengeController);
adminRouter.put('/updateChallenge/:id',checkAdminLogin,updateChallengeController);
adminRouter.delete('/deleteChallenge/:id',checkAdminLogin,deleteChallengeController);


export default adminRouter;