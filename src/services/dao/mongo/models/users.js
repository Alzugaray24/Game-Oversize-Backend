import { Schema, mongoose } from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  password: String,
  loggedBy: String,
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "premium"],
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
  ],
  lastLogin: { type: Date, default: Date.now },
  favProds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

const userModel = mongoose.model("User", userSchema);

export { userModel };
