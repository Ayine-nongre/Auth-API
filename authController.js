const user = require('./userModel')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')

const createToken = (User, statusCode, res) => {
    const accessToken = jwt.sign({ email: User.email }, process.env.ACCESS_TOKEN)
    res.cookie('access', accessToken, cookieOptions = {
        expires: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    })
    res.status(statusCode).json({ status: "Success"})
}

exports.signup = async (req, res, next) => {
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.firstname || !req.body.lastname){
        return next(res.json({ Message:"Please ensure all fields are correctly filled" }))
    }

    const emailExist = await user.findOne({ email: req.body.email }).catch(err => console.error(err))
    const userNameExists = await user.findOne({ username: req.body.username}).catch(err => console.error(err))
    const data = await bcrypt.hash(req.body.password, 10).catch(err => console.error(err))
   
    if (emailExist || userNameExists) { return next(res.json({ Message: "Username or email exists already" })) }

    const newUser = new user ({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        password: data
    })

    newUser.save()
    createToken(newUser, 201, res)
}

exports.login = async (req, res, next) => {
    let data
    
    if (!req.body.email || !req.body.password){
        return next(res.json({ Message:"Please ensure all fields are correctly filled" }))
    }


    const emailExist = await user.findOne({ email: req.body.email }).catch(err => console.error(err))
    if (emailExist)  data = await bcrypt.compare(req.body.password, emailExist.password).catch(err => console.error(err))
    if (!emailExist) return next(res.status(401).json({ Message: "Incorrect email or password" }))

    if (data) createToken(emailExist, 200, res)
    if (!data) return next(res.status(401).json({ Message: "Incorrect email or password" }))
}

exports.authenticate = (req, res, next) => {
    const token = req.cookies.access

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, acc) => {
        if (err) return res.status(403).json({ Message: "You're not logged in"})
        req.acc = acc
        next()
    })
}

exports.getUser = async (req, res, next) => {
    let account 


    account = await user.findOne({ email: req.acc.email }).catch(err => console.error(err))

    if (account){
        res.json({
            Firstname: account.firstName,
            Lastname: account.lastName,
            Username: account.username,
            Email: account.email
        })
    }
}

exports.logout = (req, res, next) => {
    res.clearCookie('access')
    res.status(200).json("You're logged out")
}