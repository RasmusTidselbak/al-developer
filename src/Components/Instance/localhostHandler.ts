import { ServerConfig } from "../../Models/ServerConfig";
import * as vscode from "vscode";
import ImageConfig from "../../Models/ImageConfig";

export default class {
    public static newInstance(serverConf: ServerConfig, callback: Function) {
        const phonetic = require('phonetic');
        const random = require('random');

        serverConf.docker.name = <string>phonetic.generate({ syllables: 2 }).toUpperCase();
        serverConf.docker.password = phonetic.generate({ syllables: 2 }) + random.int(1000, 9999);
        serverConf.server = "http://" + serverConf.docker.name + "/";

        let imageName = new ImageConfig(
            serverConf.docker.NAVVersion,
            serverConf.docker.cu,
            serverConf.docker.local
        );

        this.verifyDockerEnvironment(imageName, serverConf, callback);
    }


    public static verifyDockerEnvironment(image: ImageConfig, serverConf: ServerConfig, callback: Function) {
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        ps.addCommand('$DockerProces = docker ps; if(!$DockerProces){throw "Docker is unavailable"}');
        ps.invoke()
            .then((output: any) => {
                this.imageExists(image, serverConf, callback);
            })
            .catch((err: any) => {
                this.dockerUnavailableError();
            });
    }


    public static imageExists(image: ImageConfig, serverConf: ServerConfig, callback: Function) {
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        ps.addCommand('$images = docker images -q ' + image.GetImageName() + '; if(!$images){throw "No image"}');
        ps.invoke()
            .then((output: any) => {
                this.runImage(image, serverConf, callback);
            })
            .catch((err: any) => {
                this.pullImage(image, serverConf, this.runImage, callback);
            });
    }

    public static pullImage(image: ImageConfig, serverConf: ServerConfig, imageFunction: Function, callback: Function) {
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        let statusdisp = vscode.window.setStatusBarMessage('$(cloud-download) Pulling Instance..');
        vscode.window.showInformationMessage('Pulling image ' + image.GetImageName());
        ps.addCommand('docker pull ' + image.GetImageName() + ' | Out-Null');
        ps.invoke()
            .then((output: any) => {
                imageFunction(image, serverConf, callback);
                statusdisp.dispose();
            })
            .catch((err: any) => {
                console.error('Unable to pull');
                statusdisp.dispose();
            });

    }

    public static runImage(image: ImageConfig, serverConf: ServerConfig, callback: Function) {
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        let statusdisp = vscode.window.setStatusBarMessage('$(zap) Creating Instance..');
        const licenseFilePath = vscode.workspace.getConfiguration().get('aldev.licenseFilePath');
        ps.addCommand('docker run -e accept_eula=Y -e ClickOnce=Y -e LicenseFile="' + licenseFilePath + '" -m 4g -e password=' + serverConf.docker.password + ' --hostname ' + serverConf.docker.name + ' --name ' + serverConf.docker.name + ' -p 80:80 -p 8080:8080 -p 443:443 -p 7045-7049:7045-7049 -d ' + image.GetImageName());
        ps.invoke().
            then((output: any) => {
                console.log(output);
                vscode.window.showInformationMessage('The instance ' + serverConf.docker.name + ' is starting.');
                callback(serverConf);
                statusdisp.dispose();
            })
            .catch((err: any) => {
                console.log(err);
                statusdisp.dispose();
                ps.dispose();
            });
    }

    public static removeInstance(serverConf: ServerConfig, callback:Function) {
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        let statusdisp = vscode.window.setStatusBarMessage('$(trashcan) Removing Instance..');


        ps.addCommand('$DockerProces = docker ps; if(!$DockerProces){throw "Docker is unavailable"}');
        ps.invoke()
            .then((output: any) => {
                let ps2 = new shell({
                    executionPolicy: "Bypass",
                    noProfile: true
                });
                ps2.addCommand('docker ps -aqf name=' + serverConf.docker.name + ' | %{docker stop $_; docker rm $_}');
                ps2.invoke().
                    then((output: any) => {
                        callback();
                        console.log('Removed docker instance ' + serverConf.docker.name + ' with id ' + output);
                        vscode.window.showInformationMessage('The instance ' + serverConf.docker.name + ' has been removed.');
                        statusdisp.dispose();
                    })
                    .catch((err: any) => {
                        console.log(err);
                        ps2.dispose();
                        statusdisp.dispose();
                    });
            })
            .catch((err: any) => {
                this.dockerUnavailableError();
                ps.dispose();
                statusdisp.dispose();
            });
    }

    private static dockerUnavailableError(){
        const os = require('os');
        const opn = require('opn');
        const installDocker = 'Install Docker';
        const installAccessModule = 'Get Access';
        const changeServerAgent = 'Change to Server Agent';
        
        vscode.window.showErrorMessage('Docker could not be reached, please ensure that Docker is installed and running, and that the current user (' + os.userInfo().username + ') has access to run Docker instances .', 
            installDocker,
            installAccessModule,
            changeServerAgent)
        .then((action:(string|undefined)) => {
            console.log(action);
            switch (action) {
                case installDocker:
                    opn('https://hub.docker.com/editions/community/docker-ce-desktop-windows');
                    break;
                case installAccessModule:
                    opn('https://www.axians-infoma.de/techblog/allow-access-to-the-docker-engine-without-admin-rights-on-windows/');
                    break;
                case changeServerAgent:
                    let agentConfig = vscode.workspace.getConfiguration('aldev');
                    agentConfig.update('dockerAgentType', 'server');
                    agentConfig.update('dockerAgentURL', 'http://bc.raaen.dk');
                    opn('http://raaen.dk');
                    break;
            
                default:
                    return;
            }
        });
    }
}