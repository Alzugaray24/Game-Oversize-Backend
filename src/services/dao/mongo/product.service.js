import { productModel } from "./models/product.js";
import mongoose from "mongoose";

export default class ProductServiceMongo {
  constructor() {}

  getAllProductsSortedByTitleAscending = async (options) => {
    try {
      const {
        limit = 10,
        page = 1,
        category,
        availability,
        query,
      } = options || {};

      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (availability !== undefined) {
        filter.availability = availability;
      }
      if (query) {
        filter.title = { $regex: query, $options: "i" };
      }

      const sortOption = { title: -1 }; // Ordena por título de forma ascendente por defecto

      const result = await productModel
        .find(filter)
        .sort(sortOption)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const totalItems = await productModel.countDocuments(filter);

      return {
        items: result,
        totalItems,
      };
    } catch (error) {
      throw error;
    }
  };

  getAllProductsSortedByPriceDescending = async (options) => {
    try {
      const {
        limit = 10,
        page = 1,
        category,
        availability,
        query,
      } = options || {};

      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (availability !== undefined) {
        filter.availability = availability;
      }
      if (query) {
        filter.title = { $regex: query, $options: "i" };
      }

      const result = await productModel
        .find(filter)
        .sort({ price: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const totalItems = await productModel.countDocuments(filter);

      return {
        items: result,
        totalItems,
      };
    } catch (error) {
      throw error;
    }
  };

  getAllProductsSortedByTitleDescending = async (options) => {
    try {
      const {
        limit = 10,
        page = 1,
        category,
        availability,
        query,
      } = options || {};

      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (availability !== undefined) {
        filter.availability = availability;
      }
      if (query) {
        filter.title = { $regex: query, $options: "i" };
      }

      const sortOption = { title: 1 }; // Ordena por título de forma ascendente (de la A a la Z)

      const result = await productModel
        .find(filter)
        .sort(sortOption)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const totalItems = await productModel.countDocuments(filter);

      return {
        items: result,
        totalItems,
      };
    } catch (error) {
      throw error;
    }
  };

  getAllProductsSortedByPriceAscending = async (options) => {
    try {
      const {
        limit = 10,
        page = 1,
        category,
        availability,
        query,
      } = options || {};

      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (availability !== undefined) {
        filter.availability = availability;
      }
      if (query) {
        filter.title = { $regex: query, $options: "i" };
      }

      const result = await productModel
        .find(filter)
        .sort({ price: 1 }) // Ordena por precio de forma ascendente
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      const totalItems = await productModel.countDocuments(filter);

      return {
        items: result,
        totalItems,
      };
    } catch (error) {
      throw error;
    }
  };

  save = async (product) => {
    let result = await productModel.create(product);
    return result;
  };

  findById = async (id) => {
    const result = await productModel.findById(id);
    return result;
  };

  update = async (filter, value) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(filter)) {
        return 0;
      }

      if (typeof filter === "string") {
        filter = { _id: filter };
      }

      const updatedDocument = await productModel.findOneAndUpdate(
        filter,
        value,
        { new: true }
      );

      return updatedDocument || null;
    } catch (error) {
      throw error;
    }
  };

  delete = async (id) => {
    console.log("dentro de delete", id);
    const result = await productModel.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      return id;
    } else {
      return null;
    }
  };

  async isCodeUnique(code) {
    try {
      const existingProduct = await productModel.findOne({ code });
      return !existingProduct;
    } catch (error) {
      throw error;
    }
  }

  updateStock = async (productId, newStock) => {
    try {
      const product = await productModel.findById(productId);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      product.stock = newStock;

      const updatedProduct = await product.save();

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  };
}
