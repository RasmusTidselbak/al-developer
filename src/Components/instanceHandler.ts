import * as vscode from "vscode";
import { ServerConfigMethods as sc, ServerConfig } from "../Models/ServerConfig";
import httpHandler from "./Instance/httpHandler";
import { SettingsMethods } from "../Models/Settings";
import * as fs from 'fs';

export default class {
    public static newInstance() {
        console.log('Starting New Instance');
        let navSettings = SettingsMethods.getSettings();
        SettingsMethods.validateSettings(navSettings).then(() => {
            SettingsMethods.saveSettings(navSettings);
            let dockerConf: ServerConfig = sc.defaultDockerConfig();

            dockerConf.serverInstance = "BC";
            dockerConf.docker.owner = vscode.workspace.getConfiguration().get('aldev.cloudKey');
            dockerConf.docker.backup = navSettings.backup;
            dockerConf.docker.image = navSettings.image;

            httpHandler.newInstance(dockerConf, replaceLaunchConfig);
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

        let statusdisp = vscode.window.setStatusBarMessage("$(zap) Instance: Starting");
        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, statusdisp, (status: string) => {
                    getInstanceStatus(dockerConf);
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
        let statusdisp = vscode.window.setStatusBarMessage("$(zap) Instance: Stopping");
        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, statusdisp, (status: string) => {
                    vscode.window.setStatusBarMessage("$(zap) Instance: Stopped");
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
        let statusdisp = vscode.window.setStatusBarMessage("$(zap) Instance: Restarting");
        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                vscode.window.showErrorMessage('Not implemented for local environments');
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, statusdisp, (status: string) => {
                    getInstanceStatus(dockerConf);
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

        let statusdisp = vscode.window.setStatusBarMessage("$(zap) Removing non Microsoft Extensions");
        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, statusdisp, (status: string) => {
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
        let statusdisp = vscode.window.setStatusBarMessage("$(zap) Generating symbols");
        const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
        switch (dockerAgentType) {
            case 'localhost':
                vscode.window.showErrorMessage('Not implemented for local environments');
                // localhostHandler.startInstance(dockerConf, removeLaunchConfig);
                break;
            case 'Cloud':
                httpHandler.requestAction(action, dockerConf, statusdisp, (status: string) => {
                    vscode.window.setStatusBarMessage("$(zap) Instance: Symbols Generated");
                });
                break;
        }


    }


    public static commitImage() {
        console.log('Creating Image based on the current configuration');

        const editor: any = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);

        vscode.window.showInputBox({ placeHolder: "New Image Name" }).then((ImageName) => {
            const action: string = "COMMIT=" + ImageName;
            if (ImageName === "") {
                vscode.window.showErrorMessage('Invalid image name');
                return;
            }

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
                title: "Committing instance " + dockerConf.docker.name + " to image " + ImageName
            }, (progress, token) => {
                const p = new Promise<void>(resolve => {

                    let statusdisp = vscode.window.setStatusBarMessage("$(zap) Instance: Committing");
                    const dockerAgentType = vscode.workspace.getConfiguration().get('aldev.dockerAgentType');
                    switch (dockerAgentType) {
                        case 'localhost':
                            vscode.window.showErrorMessage('Not implemented for local environments');
                            break;
                        case 'Cloud':
                            httpHandler.requestAction(action, dockerConf, statusdisp, (status: string) => {
                                resolve();
                                let navSettings = SettingsMethods.getSettings();
                                navSettings.image = ImageName;
                                SettingsMethods.saveSettings(navSettings);

                                getInstanceStatus(dockerConf);
                            });
                            break;
                    }
                });
                return p;
            });
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
            const p = new Promise<void>(resolve => {

                httpHandler.removeInstance(dockerConf, () => {
                    removeLaunchConfig();
                    resolve();
                });
            });
            return p;
        });
    }

    /**
     * openSettings
     */
    public static openSettings() {
        let settingsPath: string | undefined = SettingsMethods.settingsFolder();
        if (!settingsPath) {
            vscode.window.showErrorMessage("The settings.json manifest could not be found.");
            return;
        }

        let settingsUri: vscode.Uri = vscode.Uri.file(settingsPath);

        vscode.workspace.openTextDocument(settingsUri).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    }
}

function getInstanceStatus(serverConf: ServerConfig) {
    vscode.window.setStatusBarMessage("$(zap) Instance: Starting");
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Starting instance " + serverConf.docker.name
    }, (progress, token) => {
        const p = new Promise<void>(resolve => {

            httpHandler.getInstanceStatus(serverConf, (status: string) => {
                vscode.window.setStatusBarMessage("$(zap) Instance: " + status);
                resolve();
            });
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