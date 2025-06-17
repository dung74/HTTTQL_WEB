import { Op } from "sequelize";
import db from "../models/index.js";

const insertProduct = async (req, res) => {
  const { name, klass, stock, price } = req.body;
  let existProduct = await db.products.findOne({
    where: {
      name: name,
    },
  });
  if (existProduct) {
    return res
      .status(200)
      .json({ message: "Sản phẩm đã tồn tại vui lòng chọn tên khác" });
  }
  existProduct = await db.products.create({
    name: name,
    class: klass,
    stock: stock,
    price: price,
  });
  return res
    .status(201)
    .json({ message: "Tạo mới product thành công!", data: existProduct });
};

const getAllProduct = async (req, res) => {
  let { page = 1, sortBy = "id", sortOrder = "ASC", keyword } = req.query;
  const searchCondition = keyword
    ? { name: { [Op.like]: `%${keyword}%` } }
    : {};
  page === "" ? (page = 1) : (page = Number.parseInt(page));
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const products = await db.products.findAll({
    where: {
      ...searchCondition,
    },
    attributes: ["id", "name", "class", "stock", "price"],
    limit: pageSize,
    offset: offset,
    order: [[sortBy, sortOrder.toUpperCase()]],
  });
  const allProduct = await db.products.findAll({
    where: {
      ...searchCondition,
    },
    attributes: ["id", "name", "class", "stock", "price"],
    order: [[sortBy, sortOrder.toUpperCase()]],
  });
  return res.status(200).json({
    message: "Thành công",
    data: products,
    currentPage: page,
    totalItem: allProduct.length,
    totalPage: Math.ceil(allProduct.length / pageSize),
  });
};

const deleteProduct = async (req, res) => {
  const { id } = req.query;
  const product = await db.products.findOne({
    where: {
      id: id,
    },
  });
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
  await db.products.destroy({
    where: {
      id: id,
    },
  });
  return res.status(200).json({ message: "Xóa sản phẩm thành công" });
};

const updateProduct = async (req, res) => {
  const { id } = req.query;
  const { name, klass, stock, price } = req.body;
  const product = await db.products.findOne({
    where: {
      id: id,
    },
  });
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
  await db.products.update(
    {
      name: name,
      class: klass,
      stock: stock,
      price: price,
    },
    {
      where: {
        id: id,
      },
    }
  );
  return res.status(200).json({ message: "Cập nhật sản phẩm thành công" });
};

export { insertProduct, getAllProduct, deleteProduct, updateProduct };
