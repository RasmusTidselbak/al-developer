import * as vscode from "vscode";
import * as fs from 'fs';
import { ServerConfigMethods as sc, ServerConfig } from "../Models/ServerConfig";
import httpHandler from "./Instance/httpHandler";
import localhostHandler from "./Instance/localhostHandler";

export default class {
    public static newInstance() {
        // The code you place here will be executed every time your command is executed
        console.log('Starting New Instance');

        const editor: any = vscode.window.activeTextEditor;
        let settingsPath = vscode.workspace.rootPath + "/settings.json";
        if (!fs.existsSync(settingsPath)) {
            settingsPath = vscode.workspace.rootPath + "../settings.json";
        } 
        
        let settingsFile;
        if (fs.existsSync(settingsPath)) {
            let rawdata: any = fs.readFileSync(settingsPath);
            settingsFile = JSON.parse(rawdata);    
        } else {
            settingsFile = {
                "version": "bcsandbox",
                "cu": "rtm",
                "local": "dk"
            };
        }        

        let NAVVersion = settingsFile.version ? settingsFile.version : "bcsandbox";
        let NAVCU: string = settingsFile.cu ? settingsFile.cu : "rtm";
        let NAVLocal = settingsFile.local ? settingsFile.local : "dk";

        let dockerConf: ServerConfig = sc.defaultDockerConfig();

        dockerConf.docker.NAVVersion = NAVVersion;
        if (NAVCU !== 'rtm') {
            dockerConf.docker.cu = NAVCU;
        }
        dockerConf.docker.local = NAVLocal;

        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                localhostHandler.newInstance(dockerConf);
                break;
            case 'server':
                httpHandler.newInstance(dockerConf);
                break;
            case 'sandbox':
                break;
        }

        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let serverConfigs = <ServerConfig[]>config.get('configurations');
        serverConfigs.forEach(function (sc: any, index: number, object: any) {
            if (sc.name === "docker") {
                serverConfigs.splice(index, 1);
            }
        });

        serverConfigs.push(dockerConf);
        config.update('configurations', serverConfigs);

        this.copyPassword();

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
        if (confObj !== undefined) {
            dockerConf = confObj;
        } else {
            return;
        }

        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'sandbox':
                break;
            case 'localhost':
            case 'server':
                httpHandler.removeInstance(dockerConf);
                break;
        }

        serverConfigs.forEach(function (sc: any, index: number, object: any) {
            if (sc.name === "docker") {
                serverConfigs.splice(index, 1);
            }
        });

        config.update('configurations', serverConfigs);
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
        });
    }
}


