import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectToDatabase } from "./dbConnect.js";
import "./models/associations.js";
import AuthRouter from "./routes/auth.js";
import ManagerRouter from "./routes/Manager.js";
import TeamRouter from "./routes/team.js";
import DistributorRouter from "./routes/distributor.js";
import ProductRouter from "./routes/product.js";
import OrderRouter from "./routes/order.js";
import CustomerRouter from "./routes/customer.js";
import DashboardRouter from "./routes/dashboard.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

//router

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/manager", ManagerRouter);
app.use("/api/v1/team", TeamRouter);
app.use("/api/v1/distributor", DistributorRouter);
app.use("/api/v1/product", ProductRouter);
app.use("/api/v1/order", OrderRouter);
app.use("/api/v1/customer", CustomerRouter);
app.use("/api/v1/dashboard", DashboardRouter);

connectToDatabase();

const { PORT = 8080 } = process.env;

app.get("/api/v1", (req, res) => {
  return res.status(200).json("GET at /api/v1");
});

app.listen(PORT, () => {
  console.log(`Server listen at PORT: ${PORT}`);
});
