import {
  getProductsByTitleDescendingController,
  getProductsByTitleAscendingController,
  getProductsByPriceDescendingController,
  getProductsByPriceAscendingController,
  addOrRemoveProductToFavorite,
  getFavoriteProducts,
  postProductController,
  putProductController,
  deleteProductController,
} from "../../controllers/product.controller.js";
import CustomRouter from "./custom.router.js";

export default class ProductExtendRouter extends CustomRouter {
  init() {
    this.get(
      "/sorted-by-title-descending",
      ["PUBLIC"],
      getProductsByTitleDescendingController
    );
    this.get(
      "/sorted-by-title-ascending",
      ["PUBLIC"],
      getProductsByTitleAscendingController
    );
    this.get(
      "/sorted-by-price-descending",
      ["PUBLIC"],
      getProductsByPriceDescendingController
    );
    this.get(
      "/sorted-by-price-ascending",
      ["PUBLIC"],
      getProductsByPriceAscendingController
    );
    this.get(
      "/favorite",
      ["USER", "USER_PREMIUM", "ADMIN"],
      getFavoriteProducts
    );
    this.post(
      "/favorite/:productId",
      ["USER", "USER_PREMIUM", "ADMIN"],
      addOrRemoveProductToFavorite
    );
    this.post("/", ["ADMIN"], postProductController);
    this.put("/:id", ["ADMIN"], putProductController);
    this.delete("/:id", ["ADMIN"], deleteProductController);
  }
}
