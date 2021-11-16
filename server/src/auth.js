const { SESSION_NAME } = require("./config/session");

//Helper methods that are used when other routes are hit
const isLoggedIn = (req) => {
    return !!req.session.userId
}

const logIn = (req, userId, username) => {
    console.log("HIT Login method", userId, username)
    req.session.userId = userId
    req.session.username = username
    req.session.createdAt = Date.now()
}

const logOut = (req, res) => {

    return new Promise ((resolve, reject) => {
        req.session.destroy((err) => {
            if(err){
                reject(err)
            }
            res.clearCookie(SESSION_NAME)
            
            resolve()
        })
    })
}

module.exports = { isLoggedIn, logIn, logOut };