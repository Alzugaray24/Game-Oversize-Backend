import {
  cartService,
  productService,
  ticketService,
  userService,
} from "../services/service.js";
import {
  generateTicketCode,
  calculateTotalAmount,
  getUserIdFromToken,
  sendPurchaseSuccessEmail,
} from "../dirname.js";
import mongoose from "mongoose";

export const getCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    const user = await userService.findById(userId);
    if (!user) {
      const error = new Error("Usuario no encontrado.");
      error.status = 404;
      req.logger.error(
        `[${new Date().toLocaleString()}] [GET] ${
          req.originalUrl
        } - Usuario no encontrado al obtener el carrito.`
      );
      throw error;
    }
    const cart = await cartService.getAll(user);
    if (!cart) {
      const error = new Error("No se encontró el carrito.");
      error.status = 404;
      req.logger.error(
        `[${new Date().toLocaleString()}] [GET] ${
          req.originalUrl
        } - Carrito no encontrado al obtener el carrito.`
      );
      throw error;
    }
    req.logger.info(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } - Carrito obtenido exitosamente.`
    );

    res.status(200).send({
      msg: "Carritos encontrados con exito",
      carts: cart,
    });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } - Error al obtener el carrito:`,
      error
    );
    throw new Error("Error al obtener el carrito");
  }
};

export const postCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    const { productId, quantity } = req.body;
    const user = await userService.findById(userId);
    if (!user) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [POST] ${
          req.originalUrl
        } - Usuario no encontrado al agregar producto al carrito.`
      );
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    let cartId;
    if (user.cart.length === 0) {
      cartId = mongoose.Types.ObjectId();
      user.cart.push(cartId);
    } else {
      cartId = user.cart[0];
    }
    let cart = await cartService.findById(cartId);
    if (!cart) {
      cart = await cartService.create({ _id: cartId, products: [] });
    }

    console.log("Cart:", cart);
    console.log("prod", cart.products);
    const existingProductIndex = cart.products.findIndex(
      (item) => item._id.toString() === productId.toString()
    );
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ _id: productId, quantity });
    }
    await cartService.update(cart._id, cart);
    await userService.update(userId, { cart: [cart._id] });
    req.logger.info(
      `[${new Date().toLocaleString()}] [POST] ${
        req.originalUrl
      } - Producto agregado al carrito exitosamente.`
    );
    return res.status(201).json({
      message: "Producto agregado al carrito exitosamente.",
      cart: cart,
    });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [POST] ${
        req.originalUrl
      } - Error al agregar producto al carrito:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const putCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    const { product, quantity } = req.body;
    const user = await userService.findById(userId);
    if (!user) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [PUT] ${
          req.originalUrl
        } - Usuario no encontrado al actualizar el carrito.`
      );
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const cartId = user.cart[0];
    const cart = await cartService.findById(cartId);
    if (!cart) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [PUT] ${
          req.originalUrl
        } - Carrito no encontrado al actualizar el carrito.`
      );
      return res.status(404).json({ error: "Carrito no encontrado." });
    }
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === product.toString()
    );
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity = quantity;
    } else {
      cart.products.push({ product, quantity });
    }
    await cartService.update(cartId, cart);
    user.cart[0] = cart._id;
    await userService.update(userId, { cart: user.cart });
    req.logger.info(
      `[${new Date().toLocaleString()}] [PUT] ${
        req.originalUrl
      } - Carrito actualizado con éxito.`
    );
    return res.status(200).json({ status: "success", updatedCart: cart });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [PUT] ${
        req.originalUrl
      } - Error al actualizar el carrito:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deleteCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    const user = await userService.findById(userId);
    if (!user) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [DELETE] ${
          req.originalUrl
        } - Usuario no encontrado al eliminar el carrito.`
      );
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const cartId = user.cart[0];
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [DELETE] ${
          req.originalUrl
        } - ID de carrito inválido al eliminar el carrito.`
      );
      return res.status(400).json({ error: "ID de carrito inválido." });
    }
    await cartService.delete(cartId);
    req.logger.info(
      `[${new Date().toLocaleString()}] [DELETE] ${
        req.originalUrl
      } - Carrito eliminado con éxito.`
    );
    return res.json("Carrito eliminado con éxito");
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [DELETE] ${
        req.originalUrl
      } - Error al eliminar el carrito:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const finalizePurchase = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);

    const user = await userService.findById(userId);
    if (!user) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [POST] ${
          req.originalUrl
        } - Usuario no encontrado al realizar la compra.`
      );
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const cartId = user.cart[0];

    const cart = await cartService.findById(cartId);
    if (!cart) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [POST] ${
          req.originalUrl
        } - Carrito no encontrado al realizar la compra.`
      );
      return res.status(404).json({ error: "Carrito no encontrado." });
    }

    const productsFailed = [];
    const productsWithDetails = [];

    for (const item of cart.products) {
      const product = await productService.findById(item._id);
      if (!product) {
        req.logger.error(
          `[${new Date().toLocaleString()}] [POST] ${
            req.originalUrl
          } - Producto no encontrado al realizar la compra.`
        );
        return res.status(404).json({ error: "Producto no encontrado." });
      }

      if (product.stock < item.quantity) {
        productsFailed.push(item._id);
      } else {
        const updatedStock = product.stock - item.quantity;
        await productService.updateStock(product._id, updatedStock);

        productsWithDetails.push({
          price: product.price,
          stock: updatedStock,
          quantity: item.quantity,
        });
      }
    }

    const totalAmount = calculateTotalAmount(productsWithDetails);

    if (productsFailed.length === 0) {
      const ticket = await ticketService.save({
        code: generateTicketCode(),
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: user.email,
        products: cart,
      });

      const updatedCart = await cartService.update(cartId, { products: [] });

      if (!updatedCart) {
        req.logger.error(
          `[${new Date().toLocaleString()}] [POST] ${
            req.originalUrl
          } - Error al vaciar el carrito.`
        );
        return res.status(500).json({ error: "Error al vaciar el carrito" });
      }

      await sendPurchaseSuccessEmail(user.email, ticket);

      req.logger.info(
        `[${new Date().toLocaleString()}] [POST] ${
          req.originalUrl
        } - Compra realizada con éxito.`
      );

      res.status(200).send({
        msg: "Compra realizada con exito",
        ticket: ticket,
      });
    } else {
      cart.products = cart.products.filter((item) =>
        productsFailed.includes(item.product)
      );

      const updatedCart = await cartService.update(cartId, {
        products: cart.products,
      });

      if (!updatedCart) {
        req.logger.error(
          `[${new Date().toLocaleString()}] [POST] ${
            req.originalUrl
          } - Error al actualizar el carrito.`
        );
        return res
          .status(500)
          .json({ error: "Error al actualizar el carrito" });
      }

      req.logger.error(
        `[${new Date().toLocaleString()}] [POST] ${
          req.originalUrl
        } - Algunos productos no están disponibles.`
      );

      if (productsFailed.length > 0) {
        return res.status(404).json({
          error: "Algunos productos no están disponibles",
          productsFailed,
        });
      }
    }
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [POST] ${
        req.originalUrl
      } - Error al realizar la compra:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
