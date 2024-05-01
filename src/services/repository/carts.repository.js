export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll = (userId) => {
    return this.dao.getAll(userId);
  };
  save = (cart) => {
    return this.dao.save(cart);
  };
  update = (id, cart) => {
    return this.dao.update(id, cart);
  };

  findById = async (id) => {
    return this.dao.findById(id);
  };

  delete = async (id) => {
    return this.dao.delete(id);
  };

  findByUserId = async (userId) => {
    return this.dao.findByUserId(userId);
  };

  create = async (userId) => {
    return this.dao.create(userId);
  };

  createEmptyCart = async (userId) => {
    return this.dao.createEmptyCart(userId);
  };

  getCartById = async (id) => {
    return this.dao.createEmptyCart(id);
  };

  deleteProductFromCart = async (cartId, id) => {
    return this.dao.deleteProductFromCart(cartId, id);
  };
}
