import { DataTypes, Model } from "sequelize";

import sequelize from "../dbConnect.js";

class users extends Model {}

users.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      // defaultValue: "user",
      // type: DataTypes.ENUM("user", "admin"),
      // defaultValue: "user",
      // allowNull: false,
    },
    team_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "users",
  }
);

export default users;
