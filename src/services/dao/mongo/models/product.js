import { Schema, model } from "mongoose";

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  thumbnail: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, min: 0 },
  favorite: { type: Boolean, default: false },
  outstanding: { type: Boolean, default: false },
  category: {
    type: String,
    default: "laptop",
    enum: ["laptop", "mouse", "monitor", "gaming"],
  },
});

const productModel = model("products", productSchema);

export { productModel };
