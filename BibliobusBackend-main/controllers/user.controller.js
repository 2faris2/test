import * as userService from "../services/user.service.js";
// GET /users - Admin only
export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to get users", error: err });
    }
};
// GET /users/:id - Librarian/Admin
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userService.getUserById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to get user", error: err });
    }
};
// PATCH /users/:id - Librarian
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body; // ovdje možeš dodati validate middleware za tip-safe
    try {
        const updatedUser = await userService.updateUser(id, data);
        res.json(updatedUser);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to update user", error: err });
    }
};
// DELETE /users/:id - Admin
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await userService.deleteUser(id);
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ message: "Failed to delete user", error: err });
    }
};
