const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('../models/users.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function validateUser(body) {
    const registerSchema = Joi.object({
        name: Joi.string().required().trim(),
        email: Joi.string().required().trim().lowercase().email(),
        password: Joi.string().required().trim()
    });

    const loginSchema = Joi.object({
        email: Joi.string().required().trim().lowercase().email(),
        password: Joi.string().required().trim()
    });

    const updateNameSchema = Joi.object({
        name: Joi.string().required().trim(),
    })

    const updateEmailSchema = Joi.object({
        email: Joi.string().required().trim().lowercase().email()
    })

    const updatePasswordSchema = Joi.object({
        password: Joi.string().required().trim()
    })

    const updateSchema = Joi.object({
        name: Joi.string().required().trim(),
        email: Joi.string().required().trim().lowercase().email()
    })

    if (body.name && body.email && body.password) {
        return registerSchema.validate(body);
    }

    if (!body.name && body.email && body.password) {
        return loginSchema.validate(body);
    }

    if (!body.password && body.name && !body.email) {
        return updateNameSchema.validate(body);
    }
    if (!body.password && !body.name && body.email) {
        return updateEmailSchema.validate(body);
    }
    if (body.password && !body.name && !body.email) {
        return updatePasswordSchema.validate(body);
    }
    if (!body.password && body.name && body.email) {
        return updateSchema.validate(body);
    }
}

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required...'
            })
        }

        const { error, value } = validateUser({ name, email, password });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        const token = jwt.sign({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: '7d'
        });

        res.status(201).json({
            message: 'User registered successfuly',
            token
        });
    }
    catch (error) {
        console.error('Registered Error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const { error, value } = validateUser({ email, password });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                message: 'User with the given email does not exists'
            }); 
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '7d'
            }
        );

        res.status(200).json({
            message: 'User Logged In successfuly',
            token
        });
    }
    catch (error) {
        console.error('Login error: ', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
}

async function update(req, res) {
    try {
        const { name, email } = req.body;
        if (!name && !email) {
            return res.status(400).json({ message: "The name or email can't be empty" });
        }
        if (name && !email) {
            const { error, value } = validateUser({ name });
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const currentUser = await User.findById(req.user.id);
            currentUser.name = name;
            await currentUser.save();
            const token = jwt.sign(
                {
                    id: currentUser._id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role
                },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '7d'
                }
            );
            res.status(200).json({
                message: `User updated successfully`,
                token
            });
        }
        
        if (!name && email) {
            const { error, value } = validateUser({ email });
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({ message: 'The email u are trying to include is already registered'});
            }
            const currentUser = await User.findById(req.user.id)
            currentUser.email = email;
            await currentUser.save();
            const token = jwt.sign(
                {
                    id: currentUser._id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role
                },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '7d'
                }
            );
            res.status(200).json({
                message: 'User updated successfully',
                token
            });
        }

        if (name && email) {
            const { error, value } = validateUser({ name, email });
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'The email you are trying to put is already registered'})
            }
            const currentUser = await User.findById(req.user.id);
            currentUser.name = name;
            currentUser.email = email;
            await currentUser.save();
            const token = jwt.sign(
                {
                    id: currentUser._id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role
                },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '7d'
                }
            );
            res.status(200).json({
                message: 'User updated successfully',
                token
            });
        }
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function resetPasswordLink(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'This email does not exist' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + (60 * 60 * 1000);
        await user.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetLink = `http://localhost:5173/reset-password/${token}`;
        const mailOptions = {
            to: email,
            from: 'noreply@internaltools.com',
            subject: 'password reset request',
            html: `
                <p>Hi ${user.name},</p>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 1 hour.</p>
                `
        }
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset Link has been sent to your email' });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong please try again later' });
    }
}

async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        const { error, value } = validateUser({ password });
        if (error) {
            return res.status(400).json({ message: error.details[0].message});
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully. You can now log in' });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong'});
    }
}

module.exports.register = register
module.exports.login = login
module.exports.update = update;
module.exports.resetPasswordLink = resetPasswordLink;
module.exports.resetPassword = resetPassword;