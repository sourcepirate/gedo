/**
 * S3 upload large file.
 */

var aws = require('aws-sdk'),
    fs = require('fs'),
    path = require('path'),
    inherits = require('util').inherits,
    ora = require('ora');

/**
 * Primitive interface to upload and download
 * files from S3 Bucket. 
 * It also support events like startupload
 * and upload.
 */

module.exports = Bucket = function (name, region, progress) {
    this.name = name;
    this.region = region || "us-east-1" ;
    this.s3 = new aws.S3({computeChecksums: true});
    this.progress = progress;
};


/**
 * List all files under the given prefix.
 * @param  String prefix
 */
Bucket.prototype.list = function (prefix) {
    var self = this;
    var params = {
        Bucket: self.name,
        Delimiter: "/",
        Prefix: prefix
    }
    return new Promise(function (resolve, reject) {
        self
            .s3
            .listObjects(params, function (err, data) {
                if (err) 
                    reject(err);
                else {
                    resolve(data);
                }
            });
    });
};

/**
 * Upload the file to given path is S3
 * @param  String filepath
 */
Bucket.prototype.upload = function (filepath) {
    var self = this;
    var readstream = fs.createReadStream(filepath);
    var objectKey = path.basename(filepath);
    var params = {
        Key: objectKey,
        Bucket: self.name
    };
    self.progress.text = "Uploading image....";
    return new Promise(function (resolve, reject) {
        params["Body"] = readstream;
        var upld = self
            .s3
            .upload(params, {partSize: 5 * 1024 * 1024, queueSize: 1},function (err, data) {
                if (err) 
                    reject(err);
                else {
                    upld.data = data;
                    resolve(upld);
                }
            });
        upld.on('httpUploadProgress', function (data) {
            self.progress.color = "yellow";
            self.progress.text = `Uploading ${data.loaded} of ${data.total} Bytes...`;
        });
    });
};


/**
 * Download files from s3 bucket.
 * @param  String filename
 * @param  String tofilepath @description Destination path
 */
Bucket.prototype.download = function (filename, tofilepath) {
    var self = this;
    var ws = fs.createWriteStream(tofilepath);
    // for progress bars.
    var totalBytes = 0;
    var bytesLoaded = 0;

    var params = {
        "Bucket": self.name,
        "Key": filename
    };
    
    var s3Object = self
        .s3
        .getObject(params);

    s3Object.on('httpHeaders', function(status, headers, response){
        totalBytes = parseInt(headers['content-length']);
    });

    var s3Stream = s3Object.createReadStream();

    s3Stream.on('data', function(chunk){
        bytesLoaded += chunk.length;
        self.progress.text = `Downloading ${bytesLoaded} of ${totalBytes} Bytes...`;
    });

    s3Stream.pipe(ws);

    return new Promise(function(resolve, reject) {
        s3Stream.on('end', function(){
            self.progress.stop();
            resolve(s3Stream);
        });    
        s3Stream.on('error', function(err){
            reject(err);
        });
    });
};