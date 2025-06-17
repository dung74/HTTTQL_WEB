import { DataTypes, Model } from "sequelize";

import sequelize from "../dbConnect.js";

class orders extends Model {}

orders.init(
  {
    product_id: {
      type: DataTypes.INTEGER,
    },
    distributor_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "orders",
  }
);

export default orders;
