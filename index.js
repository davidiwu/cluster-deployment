
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const pkg = require('./package.json');
const argio = require('argio');
const args = argio();
const shell = require('./shell');
const Repo = require('./git.repo');
const Image = require('./docker.image');
const Chart = require('./helm.chart');

const deps = ['git', 'docker', 'helm', 'kubectl'];

class DeployFlow {
    constructor() {
        this.dry = args.get('dry') !== undefined;
        this.imageOnly = args.get('image-only') !== undefined;
        this.chartOnly = args.get('chart-only') !== undefined;
        this.debug = args.get('debug') != undefined;
        this.local = args.get('local') != undefined;
        this.purgeFirst = args.get('purge') !== undefined;
        this.namespace = args.get('n');
        this.repoBranch = args.get('b') || 'master';
        this.steps = [];
    }

    checkVersion() {
        if (args.get('version')) {
            logger.info(pkg.version)
            logger.exit_success()
          }
    }

    printHelp() {
        if (args.get('help') || args.params.attributes.includes('h')) {
            logger.info('Usage: git-to-k8s repo_url [--dry] [-b branch] [-n namespace] [--purge] [--debug] [--local] [--image-only] [--chart-only]')
            logger.info('Options:')
            logger.info('    -b branch: specify the git branch for a remote repository')
            logger.info('    -n namespace: specify the target namespace for deployment(When specified,')
            logger.info('                  it will override the one specified in package.json if there is any)')
            logger.info('    --help: get help info')
            logger.info('    --local: use a local file system copy as source')
            logger.info('    --purge: purge helm release first before deploy each chart')
            logger.info('    --image-only: only update images to registry')
            logger.info('    --chart-only: only deploy charts without touching images')
            logger.info('    --dry: dry run only and shows commands to execute, with images will be built')
            logger.info('    --debug: show debug info from helm')
            logger.exit_success()
          } 
    }

    getRepoInfo() {
        if(args.subcommand === undefined) {
            logger.fatal('Git remote url is required! type --help for more information!');
        }

        this.repoUrl = this.local ? path.resolve(args.subcommand) : args.subcommand;
        const repoName = /\/([^\/]+)$/.exec(this.repoUrl);
        if(!repoName) {
            logger.fatal('Invalid repo url');
        }

        this.repoName = repoName[1].replace(/.git$/, '').replace(/[^\w.-]/g, '');
        this.repo = new Repo({
            repoBranch: this.repoBranch,
            repoUrl: this.repoUrl,
            repoName: this.repoName,
            local: this.local
        })
    }

    parseProjFile() {
        try {
            this.proj = JSON.parse(fs.readFileSync(path.join(pkg.tmpDir, this.repoName, pkg.projFile)));

            this.images = this.proj.images.map(image => new Image({
                name: image.name,
                path: image.path,
                tag: image.tag,
                dockerfile: image.dockerfile,
                registry: image.registry || this.proj.deploy.registry,
                prepare: image.prepare
            }));

            this.charts = this.proj.deploy.charts.map(chart => new Chart({
                path: chart.path,
                values: chart.values,
                release: chart.release,
                namespace: this.namespace || chart.namespace || this.proj.deploy.namespace,
                purge: this.purgeFirst,
                debug: this.debug
            }));

        } catch(e) {
            logger.error(e);
            logger.fatal(`Invalid project file: ${pkg.projFile}`);
        }
    }

    prepareGitCmds() {
        const parseProjFile = this.parseProjFile.bind(this);
        parseProjFile.dry = true;

        const gitCmds = this.repo.copyGitRepoCmds();

        this.steps.push(new Step({
            name: `${this.local ? 'Copy' : 'Clone'} repo to local tmp work directory`,
            cmds: gitCmds,
            dryCmds: gitCmds,
            post: parseProjFile
        }))
    }

    prepareDockerImageCmds() {
        const buildImageCmds = []
        if(!this.chartOnly) {
            this.images.forEach(image => {
                buildImageCmds.concat(image.buildImageCmds())
            })
        }

        const pushImageCmds = this.chartOnly ? [] : this.images.map(image => image.pushImageCmds());

        this.steps.push(new Step({
            name: 'Build docker images and push to registry',
            cmds: buildImageCmds.concat(pushImageCmds),
            dryCmds: buildImageCmds
        }));
    }

    prepareHelmCmds() {
        const deployChartsCmds = [];
        if(!this.imageOnly) {
            this.charts.forEach(chart => {
                deployChartsCmds.concat(chart.helmCmds());
            })
        }

        this.steps.push(new Step({
            name: "Deploy charts",
            cmds: deployChartsCmds
        }));
    }

    prepareCmds() {
        // step 1: copy git repo
        this.prepareGitCmds();

        // step 2: build docker images and push to registry
        this.prepareDockerImageCmds();

        // step 3: deploy helm charts
        this.prepareHelmCmds();
    }
    
    runSteps() {
        this.steps.forEach((step, index) => {
            logger.iinfo(`Step: ${1 + index} / ${this.steps.length} - ${step.name}`);
            step.run();
        })
    }

    dryRunSteps() {
        logger.iinfo('dry running...')
        this.steps.forEach((step, index) => {
            logger.iinfo(`Step: ${1 + index} / ${this.steps.length} - ${step.name}`);
            step.dryRun();
        })
    }

    run() {
        this.checkVersion();
        this.printHelp();

        shell.checkDeps(deps);
        this.getRepoInfo();
        this.prepareCmds();

        if(this.dry) {
            this.dryRunSteps();
        } else {
            this.runSteps();
        }
    }
}

module.exports = DeployFlow;