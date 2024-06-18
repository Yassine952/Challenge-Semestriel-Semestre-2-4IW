import Router from "express";
import { HelloController } from "../controllers/helloController.js";
import authRoutes from "./auth.js";
import productRoutes from "./product.js"
export const indexRouter = Router();

indexRouter.use("/api/auth", authRoutes);
indexRouter.use('/api/products', productRoutes);  // Utilisez les routes des produits

indexRouter.get("/", HelloController.index);
