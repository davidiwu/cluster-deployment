
const logger = require('./logger');
const shell = require('./shell');

module.exports = class Step {
    constructor(options = {}) {
        this.preHook = options.pre
        this.postHook = options.post
        this.name = options.name
        this.cmds = options.cmds
        this.fatal = options.fatal !== false
        this.checked = false
        this.dryCmds = options.dryCmds || []
    }

    run() {
        if(this.preHook) {
            this.preHook();
        }

        this.cmds.forEach(cmd => {
            logger.tip(`- shell: ${cmd} `);
            if(this.fatal) {
                shell.run(cmd);
            } else {
                shell.safeRun(cmd)
            }
        })

        if(this.postHook) {
            this.postHook();
        }
    }

    dryRun() {
        if(this.preHook && this.preHook.dry) {
            this.preHook();
        }

        this.dryCmds.forEach(cmd => {
            logger.tip(`-shell: ${cmd} `);
            if(this.fatal) {
                shell.run(cmd);
            } else {
                shell.safeRun(cmd);
            }
        })

        if(this.postHook && this.postHook.dry) {
            this.postHook();
        }
    }
}