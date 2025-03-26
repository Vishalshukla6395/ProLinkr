import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  password: { type: String, required: true },
  profilePicture: {
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dtrha4r0d/image/upload/v1742971136/default_ezhx50.jpg",
    },
    publicId: {
      type: String,
      default: "default_profile",
    },
  },
  createdAt: { type: Date, default: Date.now },
  token: { type: String, default: "" },
});

const User = mongoose.model("User", UserSchema);

export default User;
