const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { logIn } = require('../auth.js');
const { guest } = require('../middleware/auth.js');
const { catchAsync } = require('../middleware/errors.js');

router.post('/api/register', guest, catchAsync( async (req, res) => {
    const { firstName, lastName, username, password } = req.body
    console.log("HIT REGISTER POST", username, firstName, password)

    const found = await User.exists({ username })

    if (found) {
        throw new Error('Username already exists')
    }

    const users = await User.find({})
    
    User.create({
        username, firstName, lastName, password, ranking: users.length + 1
        }, function(err, user){
            if(err){
                console.log(err)
            }
            else {
                console.log(`User has been created ${user}`)
                logIn(req, user.id, user.username)
                res.json({ data: user })
            }
            
    });
}))

module.exports = router;