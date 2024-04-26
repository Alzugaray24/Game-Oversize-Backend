import { cartService, productService } from "../services/service.js";
import ProductDTO from "../services/dto/product.dto.js";
import { userService } from "../services/service.js";
import { sendDeletedProdEmail } from "../dirname.js";

export const getProductController = async (req, res) => {
  try {
    const validationErrors = ProductDTO.validateForRead();

    if (validationErrors.length > 0) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [GET] ${
          req.originalUrl
        } error al obtener los productos`
      );
      return res.status(400).json({ errors: validationErrors });
    }

    const products = await productService.getAll();
    req.logger.info(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } - Productos obtenidos con éxito:`,
      products
    );

    res.status(200).send({
      msg: "Productos encontrados con exito",
      productos: products,
    });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } - Error al obtener los productos:`,
      error
    );
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const postProductController = async (req, res) => {
  try {
    const { title, description, price, thumbnail, code, stock } = req.body;
    const productData = { title, description, price, thumbnail, code, stock };
    const validationErrors = await ProductDTO.validateForCreate(productData);

    if (validationErrors.length > 0) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [GET] ${
          req.originalUrl
        } error al crear un producto`
      );
      return res.status(400).json({ errors: validationErrors });
    }

    const result = await productService.save(productData);
    req.logger.info(
      `[${new Date().toLocaleString()}] [POST] ${
        req.originalUrl
      } - Producto creado con éxito`
    );
    return res.status(201).json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [POST] ${
        req.originalUrl
      } - Error al crear el producto:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const putProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const newProduct = req.body;

    const validationErrors = ProductDTO.validateForUpdate(newProduct);
    if (validationErrors.length > 0) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [GET] ${
          req.originalUrl
        } error al actualizar los productos`
      );
      return res.status(400).json({ errors: validationErrors });
    }

    const updatedProduct = await productService.update(id, newProduct);

    if (!updatedProduct) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [PUT] ${
          req.originalUrl
        } - Producto no encontrado para actualizar`
      );
      return res
        .status(404)
        .json({ error: "Producto no encontrado para actualizar" });
    }

    req.logger.info(
      `[${new Date().toLocaleString()}] [PUT] ${
        req.originalUrl
      } - Producto actualizado con éxito`
    );
    return res.status(200).json({ status: "success", updatedProduct });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [PUT] ${
        req.originalUrl
      } - Error al actualizar el producto:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    const users = await userService.getAll();

    const usersPremium = users.items.filter(
      (user) => user.role === "user_premium"
    );

    for (const user of usersPremium) {
      for (const cartId of user.cart) {
        const cart = await cartService.findById(cartId);
        for (const prod of cart.products) {
          if (prod._id.toString() === id) {
            await sendDeletedProdEmail(user.email);
            req.logger.info(
              `[${new Date().toLocaleString()}] Se eliminó un producto del carrito del usuario premium`
            );
          }
        }
      }
    }

    const deletedProductId = await productService.delete(id);

    if (!deletedProductId) {
      req.logger.error(
        `[${new Date().toLocaleString()}] [DELETE] ${
          req.originalUrl
        } - Producto no encontrado para eliminar`
      );
      return res
        .status(404)
        .json({ error: "Producto no encontrado para eliminar" });
    }

    for (const user of users.items) {
      for (const cartId of user.cart) {
        const cart = await cartService.findById(cartId);
        if (
          cart &&
          cart.products.some(
            (product) => product._id.toString() === deletedProductId.toString()
          )
        ) {
          cart.products = cart.products.filter(
            (product) => product._id.toString() !== deletedProductId.toString()
          );
          await cartService.update(cartId, { products: cart.products });
        }
      }
    }

    return res
      .status(201)
      .json({ status: "success", deleted: `Producto eliminado exitosamente` });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [DELETE] ${
        req.originalUrl
      } - Error al eliminar el producto:`,
      error
    );
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};
