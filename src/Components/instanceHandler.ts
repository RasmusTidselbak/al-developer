import * as vscode from "vscode";
import { ServerConfigMethods as sc, ServerConfig } from "../Models/ServerConfig";
import httpHandler from "./Instance/httpHandler";
import localhostHandler from "./Instance/localhostHandler";
import { SettingsMethods } from "../Models/Settings";
import * as fs from 'fs';

export default class {
    public static newInstance() {
        console.log('Starting New Instance');
        let navSettings = SettingsMethods.getSettings();
        SettingsMethods.validateSettings(navSettings).then(() => {
            SettingsMethods.saveSettings(navSettings);
            let dockerConf: ServerConfig = sc.defaultDockerConfig();

            dockerConf.docker.NAVVersion = navSettings.version ? navSettings.version : "";
            dockerConf.docker.cu = navSettings.cu;
            dockerConf.docker.local = navSettings.local;


            const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');

            switch (dockerAgentType) {
                case 'localhost':
                    localhostHandler.newInstance(dockerConf, replaceLaunchConfig);
                    break;
                case 'Cloud':
                    httpHandler.newInstance(dockerConf, replaceLaunchConfig);
                    break;
            }
        });

    }

    public static removeInstance() {
        console.log('Starting Remove Instance');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);

        let serverConfigs = <ServerConfig[]>config.get('configurations');
        let confObj: any = serverConfigs.find(obj => {
            return obj.name === "docker";
        });

        let dockerConf: ServerConfig;
        if (confObj) {
            dockerConf = confObj;
        } else {
            return;
        }

        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                localhostHandler.removeInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.removeInstance(dockerConf, removeLaunchConfig);
                break;
        }


    }

    public static copyPassword() {
        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let serverConfigs = <ServerConfig[]>config.get('configurations');
        let clipBoard = require('copy-paste');

        serverConfigs.forEach(conf => {
            if (conf.name === "docker") {
                if (conf.docker.password) {
                    clipBoard.copy(conf.docker.password, () => {
                        vscode.window.showInformationMessage('The password for ' + conf.name + ' has been copied to your clipboard.');
                    });
                }
            }
            replaceLaunchConfig(conf);
        });




    }

    public static getInstanceStatus() {
        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let serverConfigs = <ServerConfig[]>config.get('configurations');

        serverConfigs.forEach(conf => {
            if (conf.name === "docker") {

                const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
                switch (dockerAgentType) {
                    case 'localhost':
                        localhostHandler.getInstanceStatus(conf, (status: string) => {
                            vscode.window.setStatusBarMessage("$(zap) Instance: " + status);
                        });
                        break;
                    case 'Cloud':
                        httpHandler.getInstanceStatus(conf, (status: string) => {
                            vscode.window.setStatusBarMessage("$(zap) Instance: " + status);
                        });
                        break;
                }
            }
        });
    }
}


function replaceLaunchConfig(dockerConf: ServerConfig) {
    let paths: string[] = [
        vscode.workspace.rootPath + "\\.vscode\\launch.json",
        vscode.workspace.rootPath + "\\..\\app\\.vscode\\launch.json",
        vscode.workspace.rootPath + "\\..\\test\\.vscode\\launch.json"];


    paths.forEach(path => {
        let rawdata: any = fs.readFileSync(path);
        let launchFile = JSON.parse(rawdata);
        let serverConfigs = <ServerConfig[]>launchFile.configurations;
        serverConfigs.forEach(function (sc: ServerConfig, index: number, object: any) {
            if (sc.name === "docker") {
                if (sc.startupObjectId) {
                    dockerConf.startupObjectId = sc.startupObjectId;
                }
                serverConfigs.splice(index, 1);
            }

            if (sc.startupObjectId && !dockerConf.startupObjectId) {
                dockerConf.startupObjectId = sc.startupObjectId;
            }
        });

        serverConfigs.push(dockerConf);
        launchFile.configurations = serverConfigs;
        fs.writeFileSync(path, JSON.stringify(launchFile, null, 2));
    });

    // vscode.commands.executeCommand('aldev.copyPassword');
}

function removeLaunchConfig() {
    const editor: any = vscode.window.activeTextEditor;
    const config = vscode.workspace.getConfiguration('launch', editor.document.uri);


    let serverConfigs = <ServerConfig[]>config.get('configurations');
    serverConfigs.forEach(function (sc: any, index: number, object: any) {
        if (sc.name === "docker") {
            serverConfigs.splice(index, 1);
        }
    });

    config.update('configurations', serverConfigs);
}