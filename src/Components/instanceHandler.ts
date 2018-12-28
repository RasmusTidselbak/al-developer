import * as vscode from "vscode";
import { ServerConfigMethods as sc, ServerConfig } from "../Models/ServerConfig";
import httpHandler from "./Instance/httpHandler";
import localhostHandler from "./Instance/localhostHandler";

export default class {
    public static newInstance() {
        console.log('Starting New Instance');
        let navSettings = vscode.workspace.getConfiguration('aldev.NAV');

        let dockerConf: ServerConfig = sc.defaultDockerConfig();

        dockerConf.docker.NAVVersion = navSettings.get("version", "bcsandbox");
        dockerConf.docker.cu = navSettings.get("cu", "");
        dockerConf.docker.local = navSettings.get("local", "");    
        

        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                localhostHandler.newInstance(dockerConf, replaceLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.newInstance(dockerConf, replaceLaunchConfig);
                break;
        }

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
        });
    }
}


function replaceLaunchConfig(dockerConf: ServerConfig){
        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let serverConfigs = <ServerConfig[]>config.get('configurations');
        serverConfigs.forEach(function (sc: any, index: number, object: any) {
            if (sc.name === "docker") {
                serverConfigs.splice(index, 1);
            }
        });

        serverConfigs.push(dockerConf);
        config.update('configurations', serverConfigs);


        vscode.commands.executeCommand('aldev.copyPassword');
}

function removeLaunchConfig(){
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