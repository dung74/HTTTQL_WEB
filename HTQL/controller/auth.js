import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";

dotenv.config();

import db from "../models/index.js";

const register = async (req, res) => {
  const { username, password, fullname } = req.body;
  const user = await db.users.findOne({
    where: {
      username: username,
    },
  });
  if (user) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await db.users.create({
    username,
    fullname,
    password: hashedPassword,
    role: "user",
  });

  return res.status(201).json({
    message: "Đăng ký thành công!",
    data: {
      fullname: newUser.fullname,
      role: newUser.role,
      username: newUser.username,
    },
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await db.users.findOne({
    where: {
      username,
    },
  });
  if (!user) {
    return res
      .status(401)
      .json({ message: "Tài khoản mật khẩu không chính xác!" });
  }
  const comparePass = await bcrypt.compare(password, user.password);
  if (!comparePass) {
    return res
      .status(401)
      .json({ message: "Tài khoản mật khẩu không chính xác!" });
  }
  const token = jwt.sign(
    {
      id: user.id,
      fullname: user.fullname,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY
  );
  return res.status(200).json({
    message: "Đăng nhập thành công.",
    data: {
      fullname: user.fullname,
      role: user.role,
      username: user.username,
    },
    token,
  });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, team_id, fullname } = req.body;
  console.log(team_id);
  const user = await db.users.findByPk(id);
  if (!user) {
    return res.status(401).json({ message: "Không tồn tại user!" });
  }
  if (team_id) {
    const team = await db.teams.findByPk(team_id);
    if (!team) {
      return res.status(401).json({ message: "Không tồn tại team!" });
    }
  }

  await user.update({ role: role, team_id: team_id, fullname: fullname });
  return res.status(200).json({ message: "Cập nhập thành công!" });
};

const getAllUsers = async (req, res) => {
  const { keyword } = req.query;

  const searchCondition = keyword
    ? {
        fullname: { [Op.like]: `%${keyword}%` },
      }
    : {};

  // let { page = 1, sortBy = "id", sortOrder = "ASC" } = req.body;
  // page = page === "" || isNaN(page) ? 1 : Number.parseInt(page);
  // const pageSize = 10;
  // const offset = (page - 1) * pageSize;

  const users = await db.users.findAll({
    attributes: ["id", "username", "fullname", "role", "team_id"],
    where: {
      ...searchCondition,
    },
    include: [
      {
        model: db.teams,
        attributes: ["name"],
      },
    ],
    // order: [[sortBy, sortOrder.toUpperCase()]],
    // limit: pageSize,
    // offset: offset,
  });
  const usersRes = await Promise.all(
    users.map(async (user) => {
      // Nếu cần lấy thông tin team từ DB theo user.team_id
      const team = user.team_id
        ? await db.teams.findByPk(user.team_id, { attributes: ["name"] })
        : null;

      return {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        team: team?.name || null,
      };
    })
  );

  return res.status(200).json({
    message: "Thành công",
    data: usersRes,
    // pagination: { page, pageSize },
  });
};

export { register, login, updateUser, getAllUsers };
