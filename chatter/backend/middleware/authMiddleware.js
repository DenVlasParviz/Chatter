export const protectRoute = (req, res, next) => {
    console.log('protectRoute called, auth:', req.auth);

    // req.auth - это функция в новых версиях @clerk/express
    const auth = req.auth;

    if (!auth || !auth.userId) {
        console.log('Unauthorized - no auth or userId');
        return res.status(401).json({ message: "Unauthorized - you must be logged in" });
    }

    console.log('User authenticated, userId:', auth.userId);
    next();
};