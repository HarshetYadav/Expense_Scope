import mongoose from 'mongoose'

const connectdb=async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URI,{
         useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongo db connected succesfully");
    
    }
    catch(error){
        console.error("mongo db connection failed:",error.message);
        process.exit(1);
    }

};
export default connectdb;