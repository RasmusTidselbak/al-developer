import { ServerConfig } from "../../Models/ServerConfig";
import * as vscode from "vscode";
import ImageConfig from "../../Models/ImageConfig";

export default class{
    public static newInstance(serverConf: ServerConfig){
        const shell = require('node-powershell');
        const phonetic = require('phonetic');
        const random = require('random');
        const licenseFilePath = vscode.workspace.getConfiguration().get('aldev.licenseFilePath');
        // Create new Docker Instance
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        // Generate Name
        // Generate Password
        let name = <string>phonetic.generate({ syllables: 2}).toUpperCase();
        let password = phonetic.generate({ syllables: 2}) + random.int(1000, 9999);
        

        let imageName = new ImageConfig(
            serverConf.docker.NAVVersion,
            serverConf.docker.cu,
            serverConf.docker.local
        );

        ps.addCommand('docker run -e accept_eula=Y -e ClickOnce=Y -e LicenseFile="' + licenseFilePath + '" -e password=' + password + ' --hostname ' + name + ' --name ' + name + ' -P -d ' + imageName.GetImageName());
        ps.invoke().
            then((output:any) => {
                console.log(output);
            })
            .catch((err:any) => {
                console.log(err);
                ps.dispose();
            });

        serverConf.docker.name = name;
        serverConf.docker.password = password;

    }

    public static removeInstance(serverConf: ServerConfig){
        const shell = require('node-powershell');
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        ps.addCommand('docker ps -aqf name=' + serverConf.docker.name + ' | %{docker stop $_; docker rm $_}');
        ps.invoke().
            then((output:any) => {
                console.log('Removed instance ' + serverConf.docker.name + ' with id ' + output);
            })
            .catch((err:any) => {
                console.log(err);
                ps.dispose();
            });
    }
}