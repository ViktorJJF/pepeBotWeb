const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let botsSchema = new Schema(
  {
    server: {
      type: String,
      required: [true, "El servidor es requerido"]
    },
    language: {
      type: String,
      required: [true, "El lenguaje del servidor es requerido"]
    },
    telegramGroupId: {
      type: String
    },
    telegramId: {
      type: String
    },
    ogameEmail: {
      type: String,
      unique: true,
      required: [true, "El correo de ogame es necesario!"]
    },
    ogamePassword: {
      type: String,
      required: [true, "La contraseña de ogame es necesaria!"]
    },
    state: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users"
    },
    proxy: {
      type: String
    },
    playerId: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Bots", botsSchema);
