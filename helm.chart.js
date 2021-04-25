const _shell = require('shelljs');
const path = require('path');
const logger = require('./logger');

module.exports = class Chart {
    constructor(options = {}) {
        this.path = options.path || 'charts';
        this.values = options.values;
        this.release = options.release;
        this.namespace = options.namespace;
        this.purgeFirst = options.purge;
        this.debugArg = options.debug ? ' hooks' : '';
        this.isHelm3 = true;
        this.checkHelmVersion();
        this.namespaceArg = this.namespace ? ` --namespace ${this.namespace}` : '';
        this.getArg = this.isHelm3 ? ' hooks' : '';
    }

    helmCmds() {
        const cmds = [];
        const dir = path.join(this.path, this.values);
        if(this.isChartExist()) {
            if(this.purgeFirst) {
                cmds.push(`helm delete ${this.release}${this.isHelm3 ? '' : ' --purge'}${this.debugArg}${this.namespaceArg}`)
            } else {
                cmds.push(`helm upgrade -f ${dir} ${this.release} ${this.path}${this.debugArg}${this.namespaceArg}`)
                return cmds;
            }
        }

        cmds.push(`helm install ${this.isHelm3 ? '' : '--name'} ${this.release} -f ${dir} ${this.path}${this.debugArg}${this.namespaceArg}`);
        return cmds;
    }

    isChartExist() {
        if(_shell.exec(`helm get${getArg} ${this.release}${this.namespaceArg}`).code == 0) {
            return true;
        } else {
            return false;
        }
    }

    checkHelmVersion() {
        const helmVersion = /v(\d+)\.\d+\.\d+/.exec(_shell.exec('helm version --client').stdout || '')
        if(helmVersion && helmVersion[1] == '2') {
            this.isHelm3 = false;
        }
        logger.note(`Using helm version ${this.isHelm3 ? '>v2' : 'v2'}`);
    }
}