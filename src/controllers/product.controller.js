import { cartService, productService } from "../services/service.js";
import ProductDTO from "../services/dto/product.dto.js";
import { userService } from "../services/service.js";
import { sendDeletedProdEmail } from "../dirname.js";
import { getTokenFromCookie, getUserIdFromToken } from "../dirname.js";

export const getProductsByTitleDescendingController = async (req, res) => {
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

    const products =
      await productService.getAllProductsSortedByTitleDescending();
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

export const getProductsByTitleAscendingController = async (req, res) => {
  try {
    const { limit, page, category, availability, query } = req.query;

    const options = {
      limit: parseInt(limit, 10) || 10,
      page: parseInt(page, 10) || 1,
      category,
      availability:
        availability !== undefined ? Boolean(availability) : undefined,
      query,
    };

    const products = await productService.getAllProductsSortedByTitleAscending(
      options
    );

    res.status(200).send({
      msg: "Productos encontrados con exito",
      productos: products,
    });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } error al obtener los productos de menor a mayor por título`
    );
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const getProductsByPriceDescendingController = async (req, res) => {
  try {
    const { limit, page, category, availability, query } = req.query;

    const options = {
      limit: parseInt(limit, 10) || 10,
      page: parseInt(page, 10) || 1,
      category,
      availability:
        availability !== undefined ? Boolean(availability) : undefined,
      query,
    };

    const products = await productService.getAllProductsSortedByPriceDescending(
      options
    );

    res.status(200).send({
      msg: "Productos de precio mayor a menor encontrados con exito",
      productos: products,
    });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } error al obtener los productos de mayor a menor por precio`
    );
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const getProductsByPriceAscendingController = async (req, res) => {
  try {
    const { limit, page, category, availability, query } = req.query;

    const options = {
      limit: parseInt(limit, 10) || 10,
      page: parseInt(page, 10) || 1,
      category,
      availability:
        availability !== undefined ? Boolean(availability) : undefined,
      query,
    };

    const products = await productService.getAllProductsSortedByPriceAscending(
      options
    );

    res.status(200).send({
      msg: "Productos de precio menor a mayor encontrados con exito",
      productos: products,
    });
  } catch (error) {
    req.logger.error(
      `[${new Date().toLocaleString()}] [GET] ${
        req.originalUrl
      } error al obtener los productos de menor a mayor por precio`
    );
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const getFavoriteProducts = async (req, res) => {
  const tokenz = req.headers.cookie;
  const token = getTokenFromCookie(tokenz);
  const userId = getUserIdFromToken(token);

  const user = await userService.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  console.log(user);

  console.log(user.favProds.length);

  const favProds = user.favProds;

  if (favProds.length === 0) {
    throw new Error("No se encontraron productos favoritos");
  }

  res.status(200).send({
    status: "success",
    favProds,
  });
};

export const addOrRemoveProductToFavorite = async (req, res) => {
  try {
    const tokenz = req.headers.cookie;
    const token = getTokenFromCookie(tokenz);
    const userId = getUserIdFromToken(token);
    const { productId } = req.params;

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const product = await productService.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    product.favorite = !product.favorite;

    const booleano = product.favorite;

    await product.save();

    const index = user.favProds.findIndex((prod) =>
      prod._id.equals(product._id)
    );
    if (product.favorite && index === -1) {
      user.favProds.push(product);
    } else if (!product.favorite && index !== -1) {
      user.favProds.splice(index, 1);
    }

    await user.save();

    return res.status(200).json({ message: "actualizado", booleano });
  } catch (error) {
    console.error("Error al cambiar producto a favorito:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};

// export const changeProdToOutstanding = async (req, res) => {
//   try {
//     const tokenz = req.headers.cookie;
//     const token = getTokenFromCookie(tokenz);
//     const userId = getUserIdFromToken(token);
//     const { productId } = req.params;

//     const user = await userService.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "Usuario no encontrado." });
//     }

//     const product = await productService.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Producto no encontrado." });
//     }

//     product.outstanding = !product.outstanding;
//     await product.save();

//     if (product.outstanding) {

//     } else {

//     }

//     return res.status(200).json({ message: "Destacado actualizado con exito" });
//   } catch (error) {
//     console.error("Error al cambiar producto a favorito:", error);
//     return res
//       .status(500)
//       .json({ error: "Ocurrió un error al procesar la solicitud." });
//   }
// };

export const postProductController = async (req, res) => {
  try {
    const { title, description, price, thumbnail, code, stock, category } =
      req.body;
    const productData = {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category,
    };
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
