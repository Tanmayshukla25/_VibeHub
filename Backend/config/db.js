import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Error", error);
  }
};

export default connectToDB;
