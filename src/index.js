// ./src/index.js

//importamos dependencias
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { startDatabase } = require("./database/mongo");
const { insertAd, getAds } = require("./database/ads");
const { deleteAd, updateAd } = require("./database/ads");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const app = express();

// añadimos la librería de helmet a la aplicación para añaadir seguridad
app.use(helmet());

app.use(bodyParser.json());

// habilitamos el uso de CORS todos las peticiones que se realicen a nuestra api (peticiones inseguras)
app.use(cors());
app.use(morgan("combined"));

app.get("/", async (req, res) => {
  res.send(await getAds());
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-mf7t84n3.us.auth0.com/.well-known/jwks.json",
  }),

  audience: "https://ads-api",
  issuer: "https://dev-mf7t84n3.us.auth0.com/",
  algorithms: ["RS256"],
});

app.use(checkJwt);

app.post("/", async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);
  res.send({ message: "Nuevo ad insertado." });
});

app.delete("/:id", async (req, res) => {
  await deleteAd(req.params.id);
  res.send({ message: "removido." });
});

app.put("/:id", async (req, res) => {
  const updatedAd = req.body;
  await updateAd(req.params.id, updatedAd);
  res.send({ message: "actualizado." });
});

// iniciamos un bd mongodb en memoria
startDatabase().then(async () => {
  await insertAd({ title: "Hola, este es un primer Ad!" });

  // iniciamos el servidor
  app.listen(3001, async () => {
    console.log("Servidor iniciado en el puerto 3001");
  });
});
