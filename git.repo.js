const pkg = require('./package.json');
const path = require('path');

module.exports = class GitRepo {
    constructor(options = {}) {
        this.repoBranch = options.repoBranch
        this.repoUrl = options.repoUrl;
        this.repoName = options.repoName;

    }

    copyGitRepoCmds() {
        const cmds = [];
        const getRepoCmd = `git clone --single-branch --branch ${this.repoBranch} --depth=1 ${this.repoUrl} ${path.join(pkg.tmp_dir)}`
    }
}