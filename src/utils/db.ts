import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoConnect = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Database url not found in .env file');
    }
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected successfully');
    return connection;
  } catch (error) {
    console.error('Connection to db failed: ', (error as Error).message);
  }
};

export default mongoConnect;
