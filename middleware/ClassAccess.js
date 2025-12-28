const Class = require("../models/Class");

const classAccess = async (req, res, next) => {
    const { classId } = req.params;
    const userId = req.userId;

    const isMember = await Class.exists({
        _id: classId,
        members: userId
    });

    if (!isMember){
        return res.status(403).json({ error: "Not a class member" });
    }

    next();
}

module.exports = classAccess;