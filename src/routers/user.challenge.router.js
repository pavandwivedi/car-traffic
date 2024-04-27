import express from 'express';
import { checkUserLogin } from '../middlewares/user.middleware.js';
import {insertChallengeController,getAllChallengeController,updateChallengeController,getCompletedChallengesController} from '../controllers/user.challenge.controller.js'
import { updateInrController } from '../controllers/user.controller.js';
const  challengeRouter = express.Router()

challengeRouter.post('/insertChallenge',checkUserLogin,insertChallengeController)
challengeRouter.get('/getChallenge',checkUserLogin,getAllChallengeController)
challengeRouter.put('/updateChallenge', checkUserLogin,updateChallengeController)
challengeRouter.get('/getcompletedChallenge',checkUserLogin,getCompletedChallengesController)
challengeRouter.put('/updateINR',checkUserLogin,updateInrController)

export default challengeRouter;