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

        let statusdisp = vscode.window.setStatusBarMessage('$(cloud-download) Pulling Image..');
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
        let containerFolder = this.createContainerFolder();
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        const additionalParameters: string = vscode.workspace.getConfiguration().get('aldev.additionalParameters', "");
        let statusdisp = vscode.window.setStatusBarMessage('$(zap) Creating Instance..');
        ps.addCommand('docker run -e accept_eula=Y -e ClickOnce=Y '
            + '-e LicenseFile="C:\\run\\my\\license.flf" -e useSSL=N -e ClickOnce=Y'
            + ' -e password=' + serverConf.docker.password
            + ' --hostname ' + serverConf.docker.name
            + ' --name ' + serverConf.docker.name
            + ' -v ' + containerFolder + ':c:\\run\\my'
            + ' -p 80:80 -p 8080:8080 -p 443:443 -p 7045-7049:7045-7049 '
            + '-m 4g -d '
            + additionalParameters
            + image.GetImageName());
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

    public static removeInstance(serverConf: ServerConfig, callback: Function) {
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

    private static dockerUnavailableError() {
        const os = require('os');
        const opn = require('opn');
        const installDocker = 'Install Docker';
        const installAccessModule = 'Get Access';
        const changeToCloud = 'Change to Server Agent';

        vscode.window.showErrorMessage('Docker could not be reached, please ensure that Docker is installed and running, and that the current user (' + os.userInfo().username + ') has access to run Docker instances .',
            installDocker,
            installAccessModule,
            changeToCloud)
            .then((action: (string | undefined)) => {
                console.log(action);
                switch (action) {
                    case installDocker:
                        opn('http://aldevops.com/?p=27');
                        break;
                    case installAccessModule:
                        opn('http://aldevops.com/?p=25');
                        break;
                    case changeToCloud:
                        let agentConfig = vscode.workspace.getConfiguration('aldev');
                        agentConfig.update('dockerAgentType', 'Cloud');
                        agentConfig.update('dockerAgentURL', 'http://bc.aldevops.com');
                        opn('http://aldevops.com');
                        break;

                    default:
                        return;
                }
            });
    }

    private static createContainerFolder(): (string | undefined) {
        const fs = require('fs');
        const mkdirp = require('mkdirp');
        const editor = <vscode.TextEditor>vscode.window.activeTextEditor;
        const folder = <vscode.WorkspaceFolder>vscode.workspace.getWorkspaceFolder(editor.document.uri);
        const licenseFilePath = vscode.workspace.getConfiguration().get('aldev.licenseFilePath');

        let containerPath = folder.uri.fsPath + "/.container";
        let response = mkdirp(containerPath);
        if (!response) {
            console.log(folder);
            fs.copyFile(licenseFilePath, containerPath + '/license.flf', (err: any) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            console.log(response);
        }
        return containerPath;
    }

    public static getInstanceStatus(serverConf: ServerConfig, callback: Function) {
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        ps.addCommand('docker ps -af name=' + serverConf.docker.name + ' --format "{{.Status}}"');
        ps.invoke()
            .then((output: any) => {
                callback(output);
            })
            .catch((err: any) => {
                console.log(err);
            });
    }
}