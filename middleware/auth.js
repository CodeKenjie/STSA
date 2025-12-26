const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const header = req.headers.authorization;

    if(!header || !header.startsWith("Bearer ")){
        return res.status(401).json({ message: "Not logged in" });
    }

    const token = header.split(" ")[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_PASS);
        req.userId = decode.userId;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "invalid token" });
    }
}

module.exports = auth;