import { DataTypes, Model } from "sequelize";

import sequelize from "../dbConnect.js";

class distributors extends Model {}

distributors.init(
  {
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "distributors",
  }
);

export default distributors;
