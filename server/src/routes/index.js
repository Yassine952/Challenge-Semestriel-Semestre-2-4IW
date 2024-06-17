import Router from "express";
import { HelloController } from "../controllers/helloController.js";
import authRoutes from "./auth.js";

export const indexRouter = Router();

indexRouter.use("/api/auth", authRoutes);
indexRouter.get("/", HelloController.index);
