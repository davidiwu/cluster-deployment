const _shell = require('shelljs');
const logger = require('./logger');

module.exports = {

    parseSpecial(cmd, ...args) {
        if (/^cd /.test(cmd)) {
            _shell.cd(cmd.replace(/^cd /, ''));
            return false;
        } else {
            return true;
        }
    },

    run(cmd, ...args) {
        if (!parseSpecial(cmd, ...args)) 
            return;

        const ctx = _shell.exec(cmd, ...args)

        if (ctx.code !== 0) {
            logger.fatal(`Failed to run ${args.join(' ')}`);
        }

        return ctx;
    },

    safeRun(cmd, ...args) {
        if (!parseSpecial(cmd, ...args)) 
            return;

        const ctx = _shell.exec(cmd, ...args);

        if (ctx.code !== 0) {
            logger.warn(`Failed to run ${args.join(' ')}`);
        }

        return ctx;
    },

    checkDeps(deps) {
        logger.note(`Checking dependencies...`);
        deps.forEach(dep => {
            if(!_shell.which(dep)) {
                logger.fatal(`Dependency ${dep} was not installed!`)
            }
        })
    }
}