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

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pendingUser = await prisma.emailVerification.findUnique({
      where: { email: normalizedEmail },
    });

    if (!pendingUser) {
      return res.status(400).json({
        message: "No pending verification found. Please sign up again.",
      });
    }

    // Check OTP expiration
    if (new Date() > pendingUser.expiresAt) {
      await prisma.emailVerification.delete({
        where: { email: normalizedEmail },
      });

      return res.status(400).json({
        message: "OTP expired. Please sign up again.",
      });
    }

    // Limit incorrect attempts
    if (pendingUser.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please sign up again.",
      });
    }

    const isValidOtp =
      /^\d{6}$/.test(String(otp)) &&
      await bcrypt.compare(String(otp), pendingUser.otpHash);

    if (!isValidOtp) {
      const updated = await prisma.emailVerification.updateMany({
        where: {
          email: normalizedEmail,
          attempts: { lt: 5 },
        },
        data: {
          attempts: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        return res.status(429).json({
          message: "Too many incorrect attempts. Please sign up again.",
        });
      }

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Create account and remove pending verification atomically
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: pendingUser.name,
          email: pendingUser.email,
          password: pendingUser.passwordHash,
        },
      });

      await tx.emailVerification.delete({
        where: { email: normalizedEmail },
      });

      return createdUser;
    });

    return res.status(201).json({
      message: "Email verified and account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Could not verify OTP. Please try again.",
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
    verifyOtp
};



