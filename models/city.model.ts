import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String
  },
  {
    timestamps: true
  }
);

const City = mongoose.model('City', schema, "cities");

export default City;

