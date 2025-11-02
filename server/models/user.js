import mongoose from "mongoose";
//define the schema (structure for user collection )

const userschema=new mongoose.Schema(
{
    name:{
        type:String,
        required: true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true, // no two users with same email
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },

   
    subscriptionType: {
      type: String,
      enum: ["free", "premium", "pro"], // only these values allowed
      default: "free",
    },
    subscriptionStart: {
      type: Date,
    },
    subscriptionEnd: {
      type: Date,
    },
    balance: {
      type: Number,
      default: 0,
    },
    subscriptionEndsAt: {
      type: Date,
      default: function() {
        // Set to 1 day from now for free trial
        return new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      }
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

},
{timestamps:true}




);

//create a model from schema
const user=mongoose.model("user",userschema); //user wriiten inside the literals tells how the model is named in database it will be stored in lowercase and in plural form

export default user;
