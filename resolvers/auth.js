const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server-express')

const authResolver = {
    Mutation: {
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email: email })
            if (!user) {
                throw new UserInputError('هذا الحساب غير موجود لدينا!!')
            }
            const isEqual = await bcrypt.compare(password, user.password)
            if (!isEqual) {
                throw new UserInputError('خطأ في البريد الإلكتروني أو كلمة المرور!!')
            }
            const userForToken = {
                email: user.email,
                id: user._id,
            }
            return {
                userId: user._id,
                token: jwt.sign(userForToken, process.env.JWT_SECRET),
                username: user.username
            }
        },

        createUser: async (_, args) => {
            try {
                const existingUser = await User.findOne({ email: args.userInput.email })
                if (existingUser) {
                    throw new UserInputError('!!هذا الحساب موجود مسبقًا لدينا', {
                        invalidArgs: args.email,
                    })
                }
                const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
                const user = new User({
                    username: args.userInput.username,
                    email: args.userInput.email,
                    password: hashedPassword
                })
                await user.save()
                return user
            } catch (err) {
                throw err
            }
        }
    }
}

module.exports = { authResolver }
