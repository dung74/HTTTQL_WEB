import db from "../models/index.js";

const getAllCustomers = async (req, res) => {
  const customers = await db.customers.findAll({
    attributes: [
      "id",
      "name",
      "city",
      "channel",
      "sub_channel",
      "country",
      "latitude",
      "longitude",
    ],
  });
  return res.status(200).json({ message: "Thành công", data: customers });
};

export { getAllCustomers };
