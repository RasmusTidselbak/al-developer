import { ServerConfig } from "../../Models/ServerConfig";
import * as vscode from "vscode";
import ImageConfig from "../../Models/ImageConfig";

export default class{
    public static newInstance(serverConf: ServerConfig, callback: Function){
        const phonetic = require('phonetic');
        const random = require('random');

        serverConf.docker.name =<string>phonetic.generate({ syllables: 2}).toUpperCase();
        serverConf.docker.password = phonetic.generate({ syllables: 2}) + random.int(1000, 9999);
        serverConf.server = "http://" + serverConf.docker.name + "/";

        let imageName = new ImageConfig(
            serverConf.docker.NAVVersion,
            serverConf.docker.cu,
            serverConf.docker.local
        );

        this.imageExists(imageName, serverConf, callback);
    }

 

    public static imageExists(image: ImageConfig, serverConf: ServerConfig, callback: Function){
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        ps.addCommand('$images = docker images -q ' + image.GetImageName() + '; if(!$images){throw "No image"}');
        ps.invoke()
            .then((output: any) => {
                this.runImage(image, serverConf,callback);
            })
            .catch((err:any) =>{
                this.pullImage(image, serverConf, this.runImage, callback);
            });
    }

    public static pullImage(image: ImageConfig, serverConf: ServerConfig, imageFunction: Function, callback: Function){
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        let statusdisp = vscode.window.setStatusBarMessage('Pulling..');
        vscode.window.showInformationMessage('Pulling image ' + image.GetImageName());
        ps.addCommand('docker pull ' + image.GetImageName() + ' | Out-Null');
        ps.invoke()
            .then((output: any) => {
                imageFunction(image, serverConf, callback);
                statusdisp.dispose();
            })
            .catch((err:any) =>{
                console.error('Unable to pull');
                statusdisp.dispose();
            });
        
    }

    public static runImage(image: ImageConfig, serverConf: ServerConfig, callback: Function){
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        let statusdisp = vscode.window.setStatusBarMessage('Creating..');        
        const licenseFilePath = vscode.workspace.getConfiguration().get('aldev.licenseFilePath');
        ps.addCommand('docker run -e accept_eula=Y -e ClickOnce=Y -e LicenseFile="' + licenseFilePath + '" -e password=' + serverConf.docker.password + ' --hostname ' + serverConf.docker.name + ' --name ' + serverConf.docker.name + ' -P -d ' + image.GetImageName());
        ps.invoke().
            then((output:any) => {
                console.log(output);
                vscode.window.showInformationMessage('The instance ' + serverConf.docker.name + ' is starting.' );
                callback(serverConf);
                statusdisp.dispose();
            })
            .catch((err:any) => {
                console.log(err);
                statusdisp.dispose();
                ps.dispose();
            });
    }

    public static removeInstance(serverConf: ServerConfig){
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        let statusdisp = vscode.window.setStatusBarMessage('Removing..');        
        ps.addCommand('docker ps -aqf name=' + serverConf.docker.name + ' | %{docker stop $_; docker rm $_}');
        ps.invoke().
            then((output:any) => {
                console.log('Removed docker instance ' + serverConf.docker.name + ' with id ' + output);
                vscode.window.showInformationMessage('The instance ' + serverConf.docker.name + ' has been removed.' );
                statusdisp.dispose();
            })
            .catch((err:any) => {
                console.log(err);
                ps.dispose();
                statusdisp.dispose();
            });
    }
}