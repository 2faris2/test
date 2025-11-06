export const validate = (schema, property = "body") => (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.format(),
        });
    }
    // zamijeni originalni property validiranim podacima (tip-safe)
    req[property] = result.data;
    next();
};
