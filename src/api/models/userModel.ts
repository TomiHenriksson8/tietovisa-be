import { model, Schema } from "mongoose";
import { User } from "../../types/userTypes";
import bcrypt from "bcryptjs";

// Define the User schema
const userSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
});

// Pre-save middleware to hash passwords before saving to the database
userSchema.pre("save", async function (next) {
  const user = this as User;

  // Check if the password is modified before hashing
  if (!user.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
  }
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  const user = this as User;

  try {
    return await bcrypt.compare(enteredPassword, user.password);
  } catch (error) {
    console.error("Error during password comparison:", error);
    return false; // Return false if an error occurs
  }
};

// Export the User model
const UserModel = model<User>("User", userSchema);
export default UserModel;
