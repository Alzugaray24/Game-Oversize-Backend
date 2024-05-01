import { Router } from "express";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY } from "../../dirname.js";
import errorHandler from "../../services/middlewares/errorHandler.js";
import { getTokenFromCookie } from "../../dirname.js";

export default class CustomRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }
  init() {
    this.router.use(errorHandler);
  }

  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  handlePolicies = (policies) => async (req, res, next) => {
    try {
      if (policies[0] === "PUBLIC") return next();

      const token = req.headers.cookie;

      if (!token) {
        req.logger.info(
          `[${new Date().toLocaleString()}] [handlePolicies] ${
            req.originalUrl
          } Usuario no autenticado o token inexistente`
        );
        throw new Error("Usuario no autenticado o token inexistente");
      }

      const tokenValue = getTokenFromCookie(token);

      jwt.verify(tokenValue, PRIVATE_KEY, (error, credential) => {
        if (error) {
          req.logger.info(
            `[${new Date().toLocaleString()}] [handlePolicies] ${
              req.originalUrl
            } El usuario no tiene privilegios, revisa tus roles!`
          );
          throw new Error("Token inválido, no tiene autorización");
        }

        const user = credential.user;

        if (!policies.includes(user.role.toUpperCase())) {
          req.logger.info(
            `[${new Date().toLocaleString()}] [handlePolicies] ${
              req.originalUrl
            } El usuario no tiene privilegios, revisa tus roles!`
          );
          throw new Error("El usuario no tiene privilegios, revisa tus roles!");
        }

        req.user = user;

        next();
      });
    } catch (error) {
      res.status(403).render("error", {
        error: error.message,
        cssFileName: "error.css",
      });
    }
  };

  generateCustomResponses = (req, res, next) => {
    res.sendSuccess = (payload) =>
      res.status(200).send({ status: "Success", payload });
    res.sendInternalServerError = (error) =>
      res.status(500).send({ status: "Error", error });
    res.sendClientError = (error) =>
      res
        .status(400)
        .send({ status: "Client Error, Bad request from client.", error });
    res.sendUnauthorizedError = (error) =>
      res
        .status(401)
        .send({ error: "User not authenticated or missing token." });
    res.sendForbiddenError = (error) =>
      res.status(403).send({
        error:
          "Token invalid or user with no access, Unauthorized please check your roles!",
      });
    next();
  };

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...item) => {
      try {
        await callback.apply(this, item);
      } catch (error) {
        console.error(error);
        item[1].status(500).send(error);
      }
    });
  }
}
