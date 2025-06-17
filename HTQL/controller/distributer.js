import { Op } from "sequelize";
import db from "../models/index.js";

const insertDistributor = async (req, res) => {
  const { name } = req.body;
  let existDistributor = await db.distributors.findOne({
    where: {
      name,
    },
  });
  if (!existDistributor) {
    existDistributor = await db.distributors.create({
      name: name,
    });
  } else {
    return res.status(400).json({
      message: "Nhà phân phối đã tồn tại",
      data: existDistributor,
    });
  }
  return res
    .status(201)
    .json({ message: "Tạo mới thành công", data: existDistributor });
};

const getAllDistributor = async (req, res) => {
  let { page, keyword } = req.query;
  const pageSize = 10;
  page === "" ? (page = 1) : (page = parseInt(page));
  const offset = (page - 1) * pageSize;

  const searchCondition = keyword
    ? {
        name: {
          [Op.like]: `%${keyword}%`,
        },
      }
    : {};
  const distributors = await db.distributors.findAll({
    where: {
      ...searchCondition,
    },
    limit: pageSize,
    offset: offset,
    attributes: ["id", "name"],
  });
  const count = await db.distributors.findAll({
    where: {
      ...searchCondition,
    },
    attributes: ["id", "name"],
  });

  const totalPage = Math.ceil(count / pageSize);
  return res.status(200).json({
    message: "Lấy danh sách thành công",
    data: distributors,
    currentPage: page,
    totalPage,
    totalItems: count.length,
  });
};

const updateDistributor = async (req, res) => {
  const { id, name } = req.body;
  const existDistributor = await db.distributors.findOne({
    where: {
      name: name,
    },
  });
  if (existDistributor) {
    return res.status(400).json({
      message: "Nhà phân phối đã tồn tại",
      data: existDistributor,
    });
  }
  const distributor = await db.distributors.findOne({
    where: {
      id: id,
    },
    attributes: ["id", "name"],
  });
  if (distributor) {
    await db.distributors.update(
      { name: name },
      {
        where: {
          id: id,
        },
      }
    );
    return res
      .status(200)
      .json({ message: "Cập nhật thành công", data: distributor });
  } else {
    return res.status(404).json({ message: "Không tìm thấy nhà phân phối" });
  }
};

const deleteDistributor = async (req, res) => {
  const { id } = req.query;
  const distributor = await db.distributors.findOne({
    where: {
      id: id,
    },
  });
  if (distributor) {
    await db.distributors.destroy({
      where: {
        id: id,
      },
    });
    return res.status(200).json({ message: "Xóa thành công" });
  } else {
    return res.status(404).json({ message: "Không tìm thấy nhà phân phối" });
  }
};

export {
  insertDistributor,
  getAllDistributor,
  updateDistributor,
  deleteDistributor,
};
