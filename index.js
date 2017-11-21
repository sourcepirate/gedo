#!/usr/bin/env node

/**
 * Command line interface
 */

var program = require('commander');
var gedo = require('./lib');

program
    .version("0.3.0")
    .option('-b, --bucket', 'Bucket on S3')
    .option('-r, --region', "S3 Region", "us-east-1");


program
    .command("push <image>")
    .description("Push a image to s3")
    .action(function (image, options) {
        gedo.push(options.bucket, options.region, image)
            .then(function(res) {console.log(res)});
    }).on("--help", function(){
        console.log("gedo push <imagename>");
    });

program
    .command("pull <image>")
    .description("Pull a image from s3")
    .action(function(image, options){
        gedo.pull(option.bucket, option.region, image);
    }).on("--help", function(){
        console.log("gedo pull <imagename>");
    });

program.parse(process.argv);

if(program.args.length == 0){
    program.help();
}