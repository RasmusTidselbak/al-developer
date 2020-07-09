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
            if (dockerConf.docker.NAVVersion.toUpperCase() === "BC15") {
                dockerConf.serverInstance = "BC";
            }
            dockerConf.docker.cu = navSettings.cu;
            dockerConf.docker.local = navSettings.local;
            dockerConf.docker.owner = vscode.workspace.getConfiguration().get('aldev.cloudKey');
            dockerConf.docker.backup = navSettings.backup;
            dockerConf.docker.image = navSettings.image;

            const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');

            switch (dockerAgentType) {
                case 'localhost':
                    localhostHandler.newInstance(dockerConf, replaceLaunchConfig);
                    break;
                case 'Cloud':
                    httpHandler.newInstance(dockerConf, replaceLaunchConfig);
                    break;
            }
        })
            .catch((err) => {
                console.log(err);
            });

    }

    public static startInstance() {
        console.log('Starting Instance');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        const action: string = "Start";

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
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, (status: string) => {
                    vscode.window.setStatusBarMessage("$(zap) Instance: Starting");
                });
                break;
        }


    }

    public static stopInstance() {
        console.log('Stopping Instance');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        const action: string = "Stop";

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
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, (status: string) => {
                    vscode.window.setStatusBarMessage("$(zap) Instance: Stopping");
                });
                break;
        }


    }
    public static restartInstance() {
        console.log('Restarting Instance');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        const action: string = "Restart";

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
                vscode.window.showErrorMessage('Not implemented for local environments');
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, (status: string) => {
                    vscode.window.setStatusBarMessage("$(zap) Instance: Restarting");
                });
                break;
        }


    }

    public static clearInstance() {
        console.log('Clearing Instance');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        const action: string = "Clear";

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
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, (status: string) => {
                    vscode.window.setStatusBarMessage("$(trashcan) Instance: Extensions Cleared");
                });
                break;
        }


    }


    public static generateSymbols() {
        console.log('Generate Symbols');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        const action: string = "Generate";

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
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, (status: string) => {
                    vscode.window.setStatusBarMessage("$(zap) Instance: Symbols Generated");
                });
                break;
        }


    }


    public static createImage() {
        console.log('Creating Image based on the current configuration');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);

        vscode.window.showInputBox({ placeHolder: "New Image Name" }).then((ImageName) => {
            const action: string = "COMMIT=" + ImageName;

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
                    vscode.window.showErrorMessage('Not implemented for local environments');
                    break;
                case 'Cloud':
                    httpHandler.requestAction(action, dockerConf, (status: string) => {
                        vscode.window.setStatusBarMessage("$(zap) Instance: Generating Image");

                        let navSettings = SettingsMethods.getSettings();
                        navSettings.image = ImageName;
                        SettingsMethods.saveSettings(navSettings);
                    });
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

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Removing instance " + dockerConf.docker.name
        }, (progress, token) => {
            const p = new Promise(resolve => {

                const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
                switch (dockerAgentType) {
                    case 'localhost':
                        localhostHandler.removeInstance(dockerConf, () => {
                            removeLaunchConfig();
                            resolve();
                        });
                        break;
                    case 'Cloud':
                        httpHandler.removeInstance(dockerConf, () => {
                            removeLaunchConfig();
                            resolve();
                        });
                        break;
                }
            });
            return p;
        });
    }
}

function getInstanceStatus(serverConf: ServerConfig) {
    vscode.window.setStatusBarMessage("$(zap) Instance: starting");
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Starting instance " + serverConf.docker.name
    }, (progress, token) => {
        const p = new Promise(resolve => {

            const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
            switch (dockerAgentType) {
                case 'localhost':
                    localhostHandler.getInstanceStatus(serverConf, (status: string) => {
                        vscode.window.setStatusBarMessage("$(zap) Instance: " + status);
                        resolve();
                    });
                    break;
                case 'Cloud':
                    httpHandler.getInstanceStatus(serverConf, (status: string) => {
                        vscode.window.setStatusBarMessage("$(zap) Instance: " + status);
                        resolve();
                    });
                    break;
            }
        });
        return p;
    });
}


function replaceLaunchConfig(serverConf: ServerConfig) {
    let paths: string[] = [
        vscode.workspace.rootPath + "\\.vscode\\launch.json",
        vscode.workspace.rootPath + "\\..\\app\\.vscode\\launch.json",
        vscode.workspace.rootPath + "\\..\\test\\.vscode\\launch.json"];


    paths.forEach(path => {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, '{"version": "0.2.0","configurations": []}');
        }

        let rawdata: any = fs.readFileSync(path);
        let launchFile = JSON.parse(rawdata);
        let serverConfigs = <ServerConfig[]>launchFile.configurations;
        serverConfigs.forEach(function (sc: ServerConfig, index: number, object: any) {
            if (sc.name === "docker") {
                if (sc.startupObjectId) {
                    serverConf.startupObjectId = sc.startupObjectId;
                }
                serverConfigs.splice(index, 1);
            }

            if (sc.startupObjectId && !serverConf.startupObjectId) {
                serverConf.startupObjectId = sc.startupObjectId;
            }
        });

        serverConfigs.push(serverConf);
        launchFile.configurations = serverConfigs;
        fs.writeFileSync(path, JSON.stringify(launchFile, null, 2));
    });
    getInstanceStatus(serverConf);
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

    config.update('configurations', serverConfigs, vscode.ConfigurationTarget.WorkspaceFolder);
}