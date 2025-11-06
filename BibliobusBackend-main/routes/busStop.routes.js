import { Router } from "express";
import { busStopController } from "../controllers/busStop.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
const router = Router();
// Public: list bus stops
router.get("/", busStopController.list);
// Admin-only routes
router.post("/", authenticate, authorize("ADMIN"), busStopController.create);
router.patch("/:id", authenticate, authorize("ADMIN"), busStopController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), busStopController.delete);
export default router;
