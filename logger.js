class Logger {

    constructor() {
    }

    log(...args) {
        console.log(...args)
    }

    info(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[36m", ...args)
    }

    iinfo(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[46m", ...args)
    }


    tip(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[32m", ...args)
    }

    note(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[2m", ...args)
    }


    head(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[42m", ...args)
    }

    warn(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[33m", ...args)
    }

    error(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[31m", ...args)
    }

    fatal(...args) {
        args.push("\x1b[0m")
        console.log("\x1b[41m", ...args)
        this.exitError()
    }

    exitSuccess() {
        process.exit(0)
    }

    exitError() {
        this.error('Exiting now..')
        process.exit(2)
    }

}

module.exports = new Logger();