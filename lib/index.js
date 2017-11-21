/**
 *  GEDO PUSH and PULL 
 */

var Docker = require('./docker'),
    Bucket = require('./bucket'),
    path = require('path');

module.exports = gedo = {
    push: function(bucket, region, imagename){
        var docker = new Docker(imagename);
        var s3 = new Bucket(bucket, region);
        return docker.save().then(function(saved){
            var absolute_path = path.join(process.cwd(), saved.saved);
            return s3.upload(absolute_path);
        });
    },
    pull: function(bucket, region, imagename){
        var docker = new Docker(imagename);
        var s3 = new Bucket(bucket, region);
        // var absolute_path = path.join(process.cwd(), `${imagename}.docker`);
        // var downloaded = s3.download(imagename, absolute_path);
        return docker.load();
    }
}