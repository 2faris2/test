// src/services/user.service.ts
import { prisma } from "../utils/prisma.js";
export const getAllUsers = () => prisma.user.findMany();
export const getUserById = (id) => prisma.user.findUnique({ where: { id } });
export const updateUser = (id, data) => prisma.user.update({ where: { id }, data });
export const deleteUser = (id) => prisma.user.delete({ where: { id } });
