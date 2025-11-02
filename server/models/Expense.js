import mongoose from "mongoose"

const expenseschema=new mongoose.Schema(
    {
     title:{
        type:String,
        required:true,
        trim:true,
     },
     description:{
        type:String,
        trim:true,
     },
     amount:{
      type:Number,
      required:true,


     },
     category:{ 
     type:String,
     required:true,
     },
     date:{
        type:Date,
        default:Date.now, //if not provided,use todays date

     },
     user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
     },

    

    },
    {timestamp:true}

);

const expense=mongoose.model("expense",expenseschema);

export default expense;