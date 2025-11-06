import { z } from "zod";
export const RoleSchema = z.enum(["ADMIN", "LIBRARIAN", "DRIVER", "MEMBER"]);
export const ReservationStatusSchema = z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
]);
export const DeliveryStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);
export const NotificationTypeSchema = z.enum([
    "DELIVERY",
    "RETURN_REMINDER",
    "SYSTEM",
]);
export const TransactionTypeSchema = z.enum(["FINE", "PAYMENT"]);
export const DayOfWeekSchema = z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
]);
