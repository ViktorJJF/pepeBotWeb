const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let validRoles = {
  values: ["ADMIN", "CLIENT"],
  message: "{VALUE} no es un rol válido"
};

let usersSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "El nombre es requerido"]
    },
    last_name: {
      type: String,
      required: [true, "El apellido es requerido"]
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"]
    },
    email: {
      type: String,
      unique: true,
      required: [true, "El correo es necesario!"]
    },
    img: String,
    role: {
      type: String,
      default: "CLIENT",
      enum: validRoles
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Users", usersSchema);
