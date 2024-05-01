import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import nodemailer from "nodemailer";
import config from "./config/config.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/img");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const PRIVATE_KEY = "CoderhouseBackendCourseSecretKeyJWT";

export const generateJWToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "1h" });
};

export const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send({ error: "User not authenticated or missing token." });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
    if (error)
      return res.status(403).send({ error: "Token invalid, Unauthorized!" });
    req.user = credentials.user;
    next();
  });
};

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    if (!req.user)
      return res.status(401).send("Unauthorized: User not found in JWT");

    if (req.user.role !== role) {
      return res
        .status(403)
        .send("Forbidden: User does not have permissions with this role.");
    }
    next();
  };
};

export function generateTicketCode() {
  const timestamp = Date.now().toString(36);
  const randomValue = Math.random().toString(36).substr(2, 5);
  return timestamp + randomValue;
}

export function calculateTotalAmount(products) {
  let totalAmount = 0;

  for (const item of products) {
    totalAmount += item.price * item.quantity;
  }

  return totalAmount;
}

export const getTokenFromCookie = (cookieString) => {
  if (!cookieString) {
    return null;
  }

  const tokenCookie = cookieString
    .split(";")
    .find((cookie) => cookie.trim().startsWith("token="));

  if (!tokenCookie) {
    return null;
  }

  return tokenCookie.split("=")[1];
};

export const sendDeleteAccountEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.EMAIL_NODEMAILER || config.emailNodemailer,
        pass: process.env.PASSWORD_NODEMAILER || config.passNodemailer,
      },
    });

    const mailOptions = {
      from: `Coder test ${
        process.env.EMAIL_NODEMAILER || config.emailNodemailer
      }`,
      to: email,
      subject: "Notificación de eliminación de cuenta",
      text: "Tu cuenta ha sido eliminada. Si tienes alguna pregunta, ponte en contacto con el soporte.",
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

export const sendPurchaseSuccessEmail = async (email, ticket) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.EMAIL_NODEMAILER || config.emailNodemailer,
        pass: process.env.PASSWORD_NODEMAILER || config.passNodemailer,
      },
    });

    const mailOptions = {
      from: `Coder test ${
        process.env.EMAIL_NODEMAILER || config.emailNodemailer
      }`,
      to: email,
      subject: "Notificación de compra",
      text:
        `Tu compra fue realizada con éxito!\n\n` +
        `Código: ${ticket.code}\n` +
        `Fecha de compra: ${ticket.purchase_datetime}\n` +
        `Monto: USD${ticket.amount}\n` +
        `Comprador: ${ticket.purchaser}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

export const sendDeletedProdEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.EMAIL_NODEMAILER || config.emailNodemailer,
        pass: process.env.PASSWORD_NODEMAILER || config.passNodemailer,
      },
    });

    const mailOptions = {
      from: `Coder test ${
        process.env.EMAIL_NODEMAILER || config.emailNodemailer
      }`,
      to: email,
      subject: `Aviso de producto eliminado`,
      text: `Un producto fue eliminado de tu carrito debido a que ya no existe`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

export const getUserIdFromToken = (token) => {
  try {
    if (!token) {
      throw new Error("Token de autenticación no proporcionado.");
    }

    const decodedToken = jwt.verify(token, PRIVATE_KEY);

    if (!decodedToken) {
      throw new Error("Token de autenticación inválido.");
    }

    const userId = decodedToken.user._id;

    return userId;
  } catch (error) {
    throw new Error("Error al obtener el ID de usuario del token.");
  }
};

export default __dirname;
