const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { logIn, logOut, isLoggedIn } = require('../auth.js');
const { guest, auth } = require('../middleware/auth.js');
const { catchAsync } = require('../middleware/errors.js');

router.post('/api/authenticated', async (req, res) => {
    console.log("HIT AUTHENTICATION GET", req.session)
    const isAuthenticated = isLoggedIn(req)
    if( isAuthenticated ) {
        console.log("User is logged in", isAuthenticated)
        const user = await User.findById(req.session.userId)
        res.status(200).json({ isAuthenticated: true, user: user})
    }
    else {
        console.log("User is not logged in")
        res.status(401).json({ message: 'User not authenticated' })
    }
})

router.post('/api/login', guest, catchAsync( async (req, res) => {
    console.log("HIT LOGIN POST", req.body)
    const { username, password } = req.body
    console.log(username, password)
    const user = await User.findOne({ username })

    if (!user || !user.matchesPassword(password)) {
        //res.status(401).json({ message: 'Invalid username or password' });
        throw new Error('Invalid email or password')
    }

    logIn(req, user.id, user.username)

    res.json({ data: user })
}))
 

router.post('/api/logout', auth, catchAsync( async (req, res) => {
    console.log("HIT LOGOUT POST")

    await logOut(req, res)
    
    res.json({ message: "Logout OK" }) 
}))

module.exports = router;