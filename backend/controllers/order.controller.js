import {
  createOrderInRepository,
  deleteOrderFromRepository,
  getOrdersFromRepository,
  updateOrdersInRepository,
  getOrderFromRepository,
} from "../repositories/order.repository.js";

export const getOrders = async (req, res) => {
  try {
    const orders = await getOrdersFromRepository({});
    res.status(200).send(orders);
  } catch (e) {
    res.status(500).send(`Failed to get a list of orders: ${e.message}`);
  }
};

export const createOrder = async (req, res) => {
  const { body } = req;
  try {
    const orders = await createOrderInRepository(body);
    console.log(orders);
    res.status(200).send(orders);
  } catch (e) {
    res.status(500).send(`Failed to create order: ${e.message}`);
  }
};


export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const orders = await updateOrdersInRepository({ _id: id }, body);
    res.status(200).send(orders);
  } catch (e) {
    res.status(500).send(`Failed to update orders ${id}: ${e.message}`);
  }
};

export const deleteOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await deleteOrderFromRepository({ _id: id });
    if (orders) {
      res.status(204).send();
    } else {
      res.status(404).send(`Failed to delete orders ${id}`);
    }
  } catch (e) {
    res.status(500).send(`Failed to delete orders ${id}: ${e.message}`);
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await getOrderFromRepository({ _id: id });
    res.status(200).send(order);
  } catch (e) {
    res.status(500).send(`Failed to fetch order ${id}: ${e.message}`);

  }
};