const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { generateOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../services/email.service");

const signup  = async (req, res) => {
    try{
      const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ 
            message: "All fields are required" });
    } 

    const normalizedEmail = email.trim().toLowerCase();

    // Allow Gmail addresses only
    if (!/^[^\s@]+@gmail\.com$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please use a valid Gmail address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if(existingUser) {
        return res.status(400).json({
            message: "User already exists" 
        });
    }

    const otp = generateOtp();

    const passwordHash = await bcrypt.hash(password, 10);
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.emailVerification.upsert({
      where: { email: normalizedEmail },
      update: {
        name: name.trim(),
        passwordHash,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      await prisma.emailVerification.deleteMany({
        where: { email: normalizedEmail },
      });

      throw emailError;
    }

    return res.status(200).json({
      message: "OTP sent to your Gmail address",
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Could not start signup. Please try again.",
    });
  }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(
            password, 
            user.password);
         
         if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password" 
            });
        }
        
        const token = jwt.sign(
            { userId: user.id, },
            process.env.JWT_SECRET,
            { expiresIn: "7d", },
        );

        res.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    signup,
    login,
};



