import db from "../models/index.js";

const createManager = async (req, res) => {
  try {
    const manager = await db.managers.findOne({
      where: { user_id: req.body.user_id },
    });
    if (manager) {
      return res.status(400).json({ message: "Manager đã tồn tại" });
    }
    const newManager = await db.managers.create({
      ...req.body,
    });

    res.status(201).json({
      message: "Tạo manager thành công",
      data: newManager,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo manager", error });
  }
};

const getAllManagers = async (req, res) => {
  try {
    const managers = await db.managers.findAll({
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["username", "fullname"],
        },
      ],
    });
    res.status(200).json({ data: managers });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách managers", error });
  }
};

export { createManager, getAllManagers };
