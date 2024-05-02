import { productService } from "../service.js";
import mongoose from "mongoose";

export default class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.price = product.price;
    this.thumbnail = product.thumbnail;
    this.code = product.code;
    this.stock = product.stock;
    this.category = product.category;
  }

  static async validateForCreate(product) {
    const errors = [];

    if (!product.title || product.title.trim() === "") {
      errors.push("El título del producto es requerido.");
    }

    if (!product.description || product.description.trim() === "") {
      errors.push("La descripción del producto es requerida.");
    }

    if (isNaN(product.price) || product.price <= 0) {
      errors.push("El precio del producto debe ser un número positivo.");
    }

    if (!product.thumbnail || product.thumbnail.trim() === "") {
      errors.push("El thumbnail del producto es requerido.");
    }

    if (!product.code || product.code.trim() === "") {
      errors.push("El código del producto es requerido.");
    } else {
      try {
        const isCodeUnique = await productService.isCodeUnique(product.code);
        console.log(isCodeUnique);
        if (!isCodeUnique) {
          errors.push("El código del producto ya está en uso.");
        }
      } catch (error) {
        console.error("Error al verificar la unicidad del código:", error);
        errors.push("Error al verificar la unicidad del código del producto.");
      }
    }

    if (!Number.isInteger(product.stock) || product.stock < 0) {
      errors.push(
        "El stock del producto debe ser un número entero positivo o cero."
      );
    }

    return errors;
  }

  static validateForRead() {
    return [];
  }

  static validateForUpdate(product) {
    const errors = [];

    if (!product.title || product.title.trim() === "") {
      errors.push("El título del producto no puede estar vacío.");
    }

    if (!product.description || product.description.trim() === "") {
      errors.push("La descripción del producto es requerida.");
    }

    if (
      product.price === undefined ||
      isNaN(product.price) ||
      product.price <= 0
    ) {
      errors.push("El precio del producto debe ser un número positivo.");
    }

    if (
      product.stock === undefined ||
      !Number.isInteger(product.stock) ||
      product.stock <= 0
    ) {
      errors.push("El stock del producto debe ser un numero positivo");
    }

    return errors;
  }

  static validateForDelete(id) {
    const errors = [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      errors.push("El ID proporcionado no es válido.");
      return errors;
    }

    return errors;
  }
}
