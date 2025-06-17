import db from "../models/index.js";

import { Op } from "sequelize";

import { startOfMonth, endOfMonth } from "date-fns";

const getDashboardData = async (req, res) => {
  const startDate = startOfMonth(new Date()); // ngày đầu tháng, ví dụ: 2025-05-01T00:00:00.000Z
  const endDate = endOfMonth(new Date()); // ngày cuối tháng, ví dụ: 2025-05-31T23:59:59.999Z
  const total_products = await db.products.count();
  const total_distributors = await db.distributors.count();
  const order_this_month = await db.orders.count({
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
  });
  return res.status(200).json({
    message: "Thành công",
    data: {
      total_products,
      total_distributors,
      order_this_month,
    },
  });
};
export { getDashboardData };
