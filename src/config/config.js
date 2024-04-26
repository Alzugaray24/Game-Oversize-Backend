import dotenv from "dotenv";
import program from "../process.js";

dotenv.config();

const mode = program.opts().mode;

let envFilePath;

switch (mode) {
  case "dev":
    envFilePath = "./src/config/.env.development";
    break;
  case "prod":
    envFilePath = "./src/config/.env.production";
    break;
  case "test":
    envFilePath = "./src/config/.env.testing";
    break;
  default:
    throw new Error("Invalid mode specified");
}

dotenv.config({ path: envFilePath });

export default {
  port: process.env.PORT,
  urlMongo: process.env.URL_MONGO,
  adminName: process.env.ADMIN_NAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  environment: mode,
  passNodemailer: process.env.PASSWORD_NODEMAILER,
  emailNodemailer: process.env.EMAIL_NODEMAILER,
};
