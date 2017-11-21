/**
 *  GEDO PUSH and PULL
 */

var Docker = require('./docker'),
    Bucket = require('./bucket'),
    path = require('path'),
    ora = require('ora');

module.exports = gedo = {
    push: function (bucket, region, imagename) {
        var self = this;
        var progress = ora("Creating Image").start();
        var docker = new Docker(imagename);
        var s3 = new Bucket(bucket, region, progress);
        return docker
            .save()
            .then(function (saved) {
                var absolute_path = path.join(process.cwd(), saved.saved);
                return s3.upload(absolute_path);
            });
    },
    pull: function (bucket, region, imagename) {
        var docker = new Docker(imagename);
        var progress = ora("Downloading Images").start();
        var s3 = new Bucket(bucket, region, progress);
        var newImage = `${imagename}.docker`;
        var absolute_path = path.join(process.cwd(), newImage);
        return s3
            .download(newImage, absolute_path)
            .then(function (stream) {
                return docker.load();
            })
            .catch(function (err) {
                console.error(err.toString('utf8'));
            });;
    }
}