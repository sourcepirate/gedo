/**
 * A thin wrapper around Docker API.
 */

var spawn = require('child_process').spawn;

module.exports = DockerImage = function(imagename){
    var self = this;
    self.name = imagename;
};

DockerImage.prototype.save = function(){
    var self = this;
    var D_ARGS = ["save", "-o"];
    D_ARGS.push(`${self.name}.docker`);
    D_ARGS.push(this.name);
    return new Promise(function(resolve, reject){
        var proc = spawn('docker', D_ARGS);
        proc.stdout.on('data', console.log.bind(console));
        proc.stderr.on('data', function(err) {
            reject(err);
        });
        proc.on('close', function(val){
            resolve({
                saved:`${self.name}.docker`,
                status: val,
                pid: proc.pid
            });
        });
    });
};

DockerImage.prototype.load = function(){
    var self = this;
    var D_ARGS = ["load", "-i"];
    D_ARGS.push(`${self.name}.docker`);
    return new Promise(function(resolve, reject){
        var proc = spawn('docker', D_ARGS);
        proc.stdout.on('data', function(data){
            console.log(data.toString('utf8'));
        });
        proc.stderr.on('data', function(err){
            reject(err);
        });
        proc.on('close', function(val){
            resolve({
                loaded: `${self.name}.docker`,
                pid: proc.pid,
                status: val
            });
        });
    });
};