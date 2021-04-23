const path = require('path');


module.exports = class Image {
    constructor(options = {}) {
        this.dockerfile = options.dockerfile || 'Dockerfile'
        this.name = options.name
        this.tag = options.tag
        this.path = options.path || '.'
        this.registry = options.registry
        this.prepare = options.prepare
    }

    buildImageCmds() {
        const cmdsToBuildImage = [];
        const tag = `${path.join(this.registry, this.name)} : ${this.tag}`;
        const dir = this.path || '.';
        if(this.prepare && this.prepare.length > 0) {
            cmdsToBuildImage.push(this.prepare);
        }
        cmdsToBuildImage.push(`docker build -t ${tag} -f ${path.join(dir, this.dockerfile)} ${dir}`);

        return cmdsToBuildImage;
    }

    pushImageCmds() {
        const cmdToPushImage = [];

        cmdToPushImage.push(`docker push ${path.join(this.registry, this.name)} : ${this.tag}`);

        return cmdToPushImage;
    }
}