#!/usr/bin/env node

/**
 * Command line interface
 */

var program = require('commander');
var gedo = require('./lib');

program.version("0.5.0");

program
    .command("push <image>")
    .option('-b, --bucket <bucket>', 'Bucket on S3')
    .option('-r, --region <region>', "S3 Region", "us-east-1")
    .description("Push a image to s3")
    .action(function (image, options) {
        gedo
            .push(options.bucket, options.region, image)
            .then(function (push_out) {
                push_out.progress.stop();
            })
            .catch(function (err) {
                console.error(err.toString('utf8'));
            });
    })
    .on("--help", function () {
        console.log("gedo push <imagename>");
    });

program
    .command("pull <image>")
    .description("Pull a image from s3")
    .option('-b, --bucket <bucket>', 'Bucket on S3')
    .option('-r, --region <region>', "S3 Region", "us-east-1")
    .action(function (image, options) {
        gedo.pull(options.bucket, options.region, image);
    })
    .on("--help", function () {
        console.log("gedo pull <imagename>");
    });

program.parse(process.argv);

if (program.args.length == 0) {
    program.help();
}