// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { auth } = require('../middleware/auth.js');
// const { catchAsync } = require('../middleware/errors.js');

// router.get('/home', auth, catchAsync( async (req, res) => {
//     const user = await User.findById(req.session.userId);
//     res.json(user);
// }))

// module.exports = router;