const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const helpers = require("./utils/helpers");
const sequelize = require("./config/connection");
// require routes after DB initialization to avoid early model loading
let routes;

const app = express();
const PORT = process.env.PORT || 3001;

const hbs = exphbs.create({ helpers });

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/vendor/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist")),
);
app.use(
  "/vendor/leaflet",
  express.static(path.join(__dirname, "node_modules/leaflet/dist")),
);

async function init() {
  try {
    if (typeof sequelize.ensureDatabaseExists === "function") {
      await sequelize.ensureDatabaseExists();
    }

    // now require routes (models will be loaded correctly)
    routes = require("./controllers");
    app.use(routes);

    await sequelize.sync({ force: false });
    app.listen(PORT, () =>
      console.log(`🌐 Server listening on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("Failed to initialize application:", err);
    process.exit(1);
  }
}

init();
