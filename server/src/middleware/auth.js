const { logOut, isLoggedIn } = require('../auth.js');
const { SESSION_ABSOLUTE_TIMEOUT } = require('../config/session.js');

const guest = (req, res, next) => {
    console.log("Guest forwarding HIT")
    if( isLoggedIn(req) ) {
        return next(new Error('You are already logged in'))
    }
    
    next()
}

const auth = (req, res, next) => {
    if( !isLoggedIn(req) ) {
        return next(new Error('You must be logged in'))
    }

    next()
}

// Manually checking if the user's session has not been active for too long
// Uses the createdAt property of the session object to track the user's session time period
const active = async (req, res, next) => {
    if( isLoggedIn(req) ){
        const now = Date.now()

        const { createdAt } = req.session

        if (now > createdAt + SESSION_ABSOLUTE_TIMEOUT) {
            await logOut(req, res)

            return next(new Error('Session expired'))
        }
    }

    next()
}
 
module.exports = { guest, auth, active };