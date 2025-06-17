import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
  }
);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database successfully");

    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

export { sequelize, connectToDatabase };
export default sequelize;
