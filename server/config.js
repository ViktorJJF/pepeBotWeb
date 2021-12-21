// =========================
// Puerto
// ========================

module.exports = {
  environment: (process.env.NODE_ENV = process.env.NODE_ENV || "dev"),
  port: (process.env.PORT = process.env.PORT || 3000),
  FB_PAGE_TOKEN:
    "EAAFeWyKYN50BAGde7NOFEsLCgIZCzN5k3JD24XO4CqOTCaY506P7oi2a8Ai1qWhhS9zOs53VFWVTMbRJ6E5b5VY4SV5cNZBpatSvCtsZBuxp6AW9sHkUw2dzDOWv9eZC4tvRiUreQlyNKebALzKDoAZCLrRkHwIDuWwWTxZCsAUwZAUgoSCS8Mx",
  SERVER_URL: "https://48791559.ngrok.io",
  GOOGLE_PROJECT_ID: "pepitobot-ksksls",
  DF_LANGUAGE_CODE: "es",
  GOOGLE_CLIENT_EMAIL: "ogame-bot@pepitobot-ksksls.iam.gserviceaccount.com",
  GOOGLE_PRIVATE_KEY:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5KIexvFveVGfc\njRNC7utMnveNxKJj4cBmGdvAj3R+K/qOCwxX+ggKEyUApwAw2dXarHfNt40s2Kl6\nQf6UKayoJy2MDEzYoeGhplvhfZrebKd0u56v+e8QCyqW4su5E1EXyZZV33QPdjo7\n2dtfmgtgsW0sxc/Gvw8jQhryUuXTw2fes4Ws5Wia3DwrR2gUUFu0Q6skL6yNhqBd\nFynAirMusieb+5MMDIOBlnfyEX96O6d/9jXMHpkryOHWa3Vpfa6aL6uyKNXTA6vW\nbUg8UrGPeVkXYLnFWQFxNY+rBqbojQ55WRjitbEpxlriSsE6cpKfkDFh+D7f97Qd\n0kWKPDZHAgMBAAECggEAS0uzGtEpXtlePy9ThOWZ5FfE/e7Xxtx4HE0psz3jNqf1\nxSuzAlfYSxiL9J71EeiT8dAvDAY3r+QPz3rk5yWnY95CxHAAFByIn+8B8Ene39K5\nqlvd5VwzHogb8q4aAJJdaNn+e79Z+Cuw9MPcVR1UwSaF6i4rF3x80G7CfIa/lYRx\nDbiWLQCOzwHiNjyIZCCeGpWmfBkmh/Y5gbP9sZDpgF3a2dwzYMHmhp5W/Eia5keJ\nZxRPqK0wUOxds8JktXVXrU4VeqXHe+0YsmZgMBqTBfqL0wTo1kp3c9lyrU2QquCr\niW+0tXHREGInTz12yZ6dBBqPM2o+l+g5p9Ji9Ls/iQKBgQDjNWK5hexB6bXAxfAR\nUfIi9Kdb2oTXdiiir4LYwFeFFDyTAg9A7mCcn/OPP7UnLNbLQCdAdMqMUHCZ4kd+\n6GNcBQKjcZnVnlQFsJnX69Fk3JVxpkw+NNP536XgrIbasEeIlBU/mjdzSIH/mcDz\nPcX1fylVhjAbDtoDK1PnoyQk4wKBgQDQnwqBHe1i09bZYFbN9/LAY0iTn+3zWRTq\nkreajjG/iitk3Sv3KRSP74vvoreRZj1WD+XyepAzaay6ViLm26784nIs/JsVXDob\nvrB/UtAOF++nVnwK4Pk9uODMVQi8bvjz1MUSdFtoIhzVEcxEDJZD01vnzG/zTpFC\nyg2vZVbKTQKBgQCse+KupJRulVV9Osa831DKaKCEgqdGSlUe686RbbMDPBGgKHgb\n+tstC+CCZwLG8qs9MT6bGA6L5qUUrUtJdHG5cbRHD/6QxNlUWHTyDfuwbiSlWnGW\n59PkZXwvy8m0Sw6DCKf42MIvqmPF/psUDVkyvY5LdsseP3AR59qShq7xsQKBgFk+\nH506Mylam4bjul5jmdmI3ywfdwfpbJQn7RjViRx5u7RrFHqnfR9RhtgdEE/Hn6do\nJ6LBoVwM8ZHIdSeyhDmzmMn7yU+q40SpHxFoWI4e2SsJSQjSUmx/4NIn8hPBmQed\nVixd0BhMt27CLVJS3BjpmmAfSSiYzHT4wD/upuDlAoGBAIr72SB5sca2uZ7W2Lz6\nF1SHNPHRmMQ3MPB5H/80XyPYqu4VVihtwy5jFmwaUYGS5QGx7tYyp3Rh1H7wYod4\nWl+GElTJ0B+mduxHF+LWrGLelM/JFRWljnfVJ7FOcaBcKRzP+WDTTbvU7kYj839t\nA6dvvSXUwV5V7YYzhikGQ05Q\n-----END PRIVATE KEY-----\n",
  KEYFILENAME:
    __dirname + "/chatbot/credentialspepitobot-ksksls-02f6c18bdc1c.json", //credenciales
  //database
  dbString:
    "mongodb+srv://ViktorJJF:Sed4cfv52309$@jfbotscluster.88rtm.mongodb.net/pepeBot",
  //hash
  saltRounds: 10,
  //JWT
  seed: "mysecretSeed",
  expiresIn: "24h",
  telegramId: "624818317",
  universe: "s208",
};
