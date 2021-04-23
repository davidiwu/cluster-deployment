const logger = require('./logger');


exports.printMsg = function(args) {
    logger.info("the is a test npm package");
    logger.info(`input params are ${args}`);
}