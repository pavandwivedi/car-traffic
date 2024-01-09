import achievementModel from "../models/achievement.model.js";
import userModel from "../models/user.model.js";
import { error, success } from "../utills/responseWrapper.utill.js";



export async function  retrieveAchievementController(req,res){
    try {
        const user = req._id;
        const allAchievements = await achievementModel.find({user});
        if(allAchievements.length<1){
            return res.send(success(200,"no achievement"));
        }  
        return res.send(success(200,allAchievements));     
    }catch (err){
        return res.send(error(500,err.message));
    }
}


export async function insertAchievementController(req,res){
    try {

        const {achievementID,status,description} = req.body;
        if(!achievementID || !status || !description){
            return res.send(error(400,"missing fields"));
        }
        const user = req._id;
        const achievement = new achievementModel({achievementID,status,description,user});
        const createdAchievement = await achievement.save();
        
        const currUser = await userModel.findById(user);
        currUser.achivements.push(createdAchievement._id);
        await currUser.save();

        return res.send(success(200,"achievement created"));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}