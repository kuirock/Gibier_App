import mongoose from "mongoose"

const connectDB = async() => {
    try{
/*        await mongoose.connect("mongodb+srv://qrg4f7egqg:xxx@cluster0.kxzbvxk.mongodb.net/nextAppDataBase?retryWrites=true&w=majority&appName=Cluster0") */
        await mongoose.connect("mongodb://127.0.0.1:27017/nextAppDataBase"); 
        console.log("Success: Connected to MongoDB")
    }catch{
        console.log("Failure: Unconnected to MongoDB")
        throw new Error()
    }
}

export default connectDB