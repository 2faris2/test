import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import { authenticate, authorize as authRoles, } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createBookSchema, updateBookSchema } from "../schemas/book.schema.js";
const router = Router();
// Public routes
router.get("/", bookController.list); // list / search books
router.get("/:id", bookController.details); // book details
// Protected routes (Librarian only)
router.post("/", authenticate, authRoles("LIBRARIAN"), validate(createBookSchema), bookController.create);
router.patch("/:id", authenticate, authRoles("LIBRARIAN"), validate(updateBookSchema), bookController.update);
router.delete("/:id", authenticate, authRoles("LIBRARIAN"), bookController.delete);
export default router;
