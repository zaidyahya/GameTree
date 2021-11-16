const catchAsync = (handler) =>
    (...args) => handler(...args).catch(args[2])

const notFound = (req, res, next) => res.status(404).json({ message: "Not Found" })

 module.exports = { catchAsync, notFound } 