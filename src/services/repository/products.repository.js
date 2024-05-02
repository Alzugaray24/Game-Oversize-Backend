export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  // ACA
  getAllProductsSortedByTitleAscending = () => {
    return this.dao.getAllProductsSortedByTitleAscending();
  };

  getAllProductsSortedByPriceDescending = (options) => {
    return this.dao.getAllProductsSortedByPriceDescending(options);
  };

  getAllProductsSortedByTitleDescending = (options) => {
    return this.dao.getAllProductsSortedByTitleDescending(options);
  };

  getAllProductsSortedByPriceAscending = (options) => {
    return this.dao.getAllProductsSortedByPriceAscending(options);
  };

  save = (product) => {
    return this.dao.save(product);
  };
  update = (id, product) => {
    return this.dao.update(id, product);
  };
  findById = async (id) => {
    return this.dao.findById(id);
  };

  delete = async (id) => {
    return this.dao.delete(id);
  };

  updateStock = async (productId, newStock) => {
    return this.dao.updateStock(productId, newStock);
  };

  isCodeUnique = async (code) => {
    return this.dao.isCodeUnique(code);
  };
}
