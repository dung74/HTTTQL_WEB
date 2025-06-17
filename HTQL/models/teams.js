import { DataTypes, Model } from "sequelize";

import sequelize from "../dbConnect.js";

class teams extends Model {}

teams.init(
  {
    name: {
      type: DataTypes.STRING,
    },
    manager_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "teams",
  }
);

export default teams;
