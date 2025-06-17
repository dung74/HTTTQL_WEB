import { DataTypes, Model } from "sequelize";

import sequelize from "../dbConnect.js";

class managers extends Model {
  static associations(models) {}
}

managers.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "managers",
  }
);

// export default managers;
