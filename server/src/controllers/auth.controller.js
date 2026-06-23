const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const signup  = async (req, res) => {
    try{
      const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ 
            message: "All fields are required" });
    } 

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if(existingUser) {
        return res.status(400).json({
            message: "User already exists" 
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    res.status(201).json({
        message: "User created successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" 
        });
    }
};

module.exports = {
    signup,
};



