import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", authenticate, authorize("ADMIN"), userController.getAllUsers);
router.get("/:id", authenticate, authorize("ADMIN", "LIBRARIAN"), userController.getUserById);
router.patch("/:id", authenticate, authorize("LIBRARIAN"), userController.updateUser);
router.delete("/:id", authenticate, authorize("ADMIN"), userController.deleteUser);
export default router;
