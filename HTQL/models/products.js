import { DataTypes, Model } from "sequelize";

import sequelize from "../dbConnect.js";

class products extends Model {}

products.init(
  {
    name: {
      type: DataTypes.STRING,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "products",
  }
);

export default products;
