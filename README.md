# cluster-deployment
a npm package used to deploy applications from git to kubernetes cluster

# Dependencies

1. we need to have those tools installed first:

    * `git`
    * `docker`
    * `helm`
    * `kubectl`

2. have login to the docker registry.

3. kubernetes cluster is ready, and kubectl can run on this cluster with correct credential.

# Install

run command:

`npm install -g cluster-deployment`

# Use this tool

run command:

`k8s-deploy <git repo url> -b master`

for dry run:

`k8s-deploy <git repo url> -b master --dry`

see Help for more information

# Help

run command `k8s-deploy --help` to get help

`
 Usage: k8s-deploy repo_url [--dry] [-b branch] [-n namespace] [--purge] [--debug] [--local] [--image-only] [--chart-only]`

 Options:

     -b branch: specify the git branch for a remote repository
     -n namespace: specify the target namespace for deployment(When specified,
                   it will override the one specified in package.json if there is any)
     --help: get help info
     --local: use a local file system copy as source
     --purge: purge helm release first before deploy each chart
     --image-only: only update images to registry
     --chart-only: only deploy charts without touching images
     --dry: dry run only and shows commands to execute, with images will be built
     --debug: show debug info from helm
