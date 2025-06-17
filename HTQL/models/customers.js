import { Model, DataTypes } from "sequelize";

import sequelize from "../dbConnect.js";

class customers extends Model {}

customers.init(
  {
    name: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    channel: {
      type: DataTypes.STRING,
    },
    sub_channel: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.FLOAT,
    },
    longitude: {
      type: DataTypes.FLOAT,
    },
  },
  {
    sequelize,
    tableName: "customers",
  }
);

export default customers;
