import mongoose from "mongoose";

const achievementSchema = mongoose.Schema({
    achievementID:{
        type: Number,
        required:true
    },
    status:{
        type:Boolean,
        default:false
    },
    description:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
})


const achievementModel = mongoose.model('achivement',achievementSchema);
export default achievementModel;