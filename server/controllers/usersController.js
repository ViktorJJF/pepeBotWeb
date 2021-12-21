const User = require("../models/Users.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config.js");

const logout = (req, res) => {
  req.logout();
  res.json({
    ok: true
  });
};
const getUser = (req, res) => {
  if (req.isAuthenticated()) {
    console.log("el usuario esta autenticado");
    return res.json({
      ok: true,
      payload: req.user
    });
  }
  return res.json({
    ok: false,
    err: {
      message: "Usuario no logeado"
    }
  });
};
const list = (req, res) => {
  User.find({
    status: true
  })
    .sort({
      last_name: "desc"
    })
    .exec((err, payload) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        payload
      });
    });
};
const create = async (req, res) => {
  let body = req.body;
  let user = new User({
    first_name: body.first_name,
    last_name: body.last_name,
    password: await bcrypt.hash(body.password, config.saltRounds),
    email: body.email,
    img: body.img,
    role: body.role
  });

  user.save((err, payload) => {
    if (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        return res.status(400).json({
          ok: false,
          message: "El usuario estaba registrado",
          err
        });
      }
      return res.status(400).json({
        ok: false,
        message: "Algo salió mal",
        err
      });
    }
    res.json({
      ok: true,
      message: "Usuario creado con éxito",
      payload
    });
  });
};
const update = async (req, res) => {
  let id = req.params.id;
  let body = req.body;
  if (body.password) {
    body.password = await bcrypt.hash(body.password, config.saltRounds);
  }
  console.log("llego esta sesion; ", req.session);
  User.findByIdAndUpdate(
    id,
    body,
    {
      new: true
    },
    (err, payload) => {
      if (err) {
        if (err.name === "MongoError" && err.code === 11000) {
          return res.status(400).json({
            ok: false,
            message: "El usuario estaba registrado",
            err
          });
        }
        return res.status(400).json({
          ok: false,
          message: "Algo salió mal",
          err
        });
      }
      res.json({
        ok: true,
        message: "Usuario actualizado con éxito",
        payload
      });
    }
  );
};
const deletes = (req, res) => {
  let id = req.params.id;
  // User.findByIdAndUpdate(id, {
  //     status: false
  // }, (err, payload) => {
  //     if (err) {
  //         return res.status(400).json({
  //             ok: false,
  //             message: "Algo salió mal",
  //             err
  //         });
  //     }
  //     res.json({
  //         ok: true,
  //         message: "Usuario eliminado con éxito",
  //         payload
  //     });
  // });
  User.findByIdAndRemove(id, (err, payload) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: "Algo salió mal",
        err
      });
    }
    res.json({
      ok: true,
      message: "Usuario eliminado con éxito",
      payload
    });
  });
};
const login = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  console.log("llego este login: ", email, password);
  User.findOne(
    {
      email
    },
    (err, userDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: "Algo salió mal",
          err
        });
      }
      if (!userDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "El usuario con ese correo no existe"
          }
        });
      }
      let passwordIsValid = bcrypt.compareSync(password, userDB.password);
      if (!passwordIsValid) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Contraseña incorrecta"
          }
        });
      }
      let token = jwt.sign(
        {
          usuario: userDB
        },
        config.seed,
        {
          expiresIn: config.expiresIn
        }
      );
      console.log("antes del inicio: ", userDB._id);
      console.log("el usuario del login es: ", userDB);
      req.login(userDB, err => {
        if (err) {
          return console.log(err);
        }
        console.log("inicio de sesion exitoso");
      });
      res.json({
        ok: true,
        message: "Bienvenido",
        user: userDB,
        token
      });
    }
  );
};

module.exports = {
  list,
  create,
  update,
  deletes,
  login,
  getUser,
  logout
};
