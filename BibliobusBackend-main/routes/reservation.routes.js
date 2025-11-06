import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
const router = Router();
// User: create reservation
router.post("/", authenticate, authorize("MEMBER"), reservationController.create);
// User/Admin: list reservations
router.get("/", authenticate, reservationController.list);
// Librarian/Admin: update status
router.patch("/:id", authenticate, authorize("LIBRARIAN", "ADMIN"), reservationController.updateStatus);
export default router;
