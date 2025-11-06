import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();
// User: list my notifications
router.get("/", authenticate, notificationController.list);
// User: mark notification as read
router.patch("/:id/read", authenticate, notificationController.markAsRead);
export default router;
