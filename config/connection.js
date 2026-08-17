const Sequelize = require("sequelize");
require("dotenv").config();

const dbName = process.env.DB_NAME || "user_db";
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || null;
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 5432;

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL)
  : new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      dialect: "postgres",
      port: dbPort,
    });

// Ensure the target database exists. Attach as a method to keep backward
// compatibility with modules that `require` this file synchronously.
sequelize.ensureDatabaseExists = async function () {
  // If a full DB URL is used, assume the external URL manages DB creation.
  if (process.env.DB_URL) return;

  // Use a temporary Sequelize connection to the default 'postgres' database
  // so we can create the target database using Sequelize-only APIs.
  const adminSequelize = new Sequelize("postgres", dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "postgres",
    logging: false,
  });

  try {
    await adminSequelize.authenticate();
    const check = await adminSequelize.query(
      "SELECT 1 FROM pg_database WHERE datname = ?;",
      { replacements: [dbName], type: Sequelize.QueryTypes.SELECT },
    );

    if (!check || check.length === 0) {
      await adminSequelize.query(`CREATE DATABASE "${dbName}";`);
    }
  } finally {
    await adminSequelize.close();
  }
};

module.exports = sequelize;
