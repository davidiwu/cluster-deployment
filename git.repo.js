const pkg = require('./package.json');
const path = require('path');

module.exports = class GitRepo {
    constructor(options = {}) {
        this.repoBranch = options.repoBranch
        this.repoUrl = options.repoUrl;
        this.repoName = options.repoName;
        this.isLocal = option.local;
    }

    copyGitRepoCmds() {
        const cmds = [];
        let getRepoCmd = `git clone --single-branch --branch ${this.repoBranch} --depth=1 ${this.repoUrl} ${path.join(pkg.tmpDir, this.repoName)}`;
        if(this.isLocal) {
            getRepoCmd = `cp -rf ${path.resolve(this.repoUrl)} ${path.join(pkg.tmpDir, this.repoName)}`;
        }

        cmds.push(`mkdir -p ${pkg.tmpDir}`);
        cmds.push(`cd ${pkg.tmpDir}`);
        cmds.push(`rm -rf ${this.repoName}`);
        cmds.push(getRepoCmd);
        cmds.push(`cd ${this.repoName}`);

        return cmds;
    }
}