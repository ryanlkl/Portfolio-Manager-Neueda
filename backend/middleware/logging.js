
const assignRequestTime = (req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
}

const logger = (req, res, next) => {
    console.log(`${req.requestTime}: ${req.method} ${req.path} from ${JSON.stringify(req.headers["user-agent"])}`)
}

module.exports = {
    assignRequestTime,
    logger
}