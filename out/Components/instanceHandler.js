"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
class default_1 {
    static newInstance() {
        // The code you place here will be executed every time your command is executed
        console.log('Starting New Instance');
        const agentURL = "http://dyn.jcdhotel.dk";
        const editor = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let settingsPath = vscode.workspace.rootPath + "/settings.json";
        if (!fs.existsSync(settingsPath)) {
            settingsPath = vscode.workspace.rootPath + "../settings.json";
        }
        let rawdata = fs.readFileSync(settingsPath);
        let settingsFile = JSON.parse(rawdata);
        let NAVVersion = settingsFile.version ? settingsFile.version : "bcsandbox";
        let NAVCU = settingsFile.cu ? settingsFile.cu : "rtm";
        let NAVLocal = settingsFile.local ? settingsFile.local : "dk";
        let serverConfigs = config.get('configurations');
        let confObj = serverConfigs.find(obj => {
            return obj.name === "docker";
        });
        let dockerConf;
        if (confObj === undefined) {
            dockerConf = {
                type: "al",
                request: "launch",
                name: "docker",
                port: 0,
                server: agentURL,
                authentication: "UserPassword",
                schemaUpdateMode: "Synchronize",
                serverInstance: "NAV",
                startupObjectId: 22,
                tenant: "",
                docker: {
                    name: "",
                    NAVVersion: NAVVersion,
                    cu: NAVCU,
                    local: NAVLocal,
                    username: "admin",
                    password: "",
                }
            };
        }
        else {
            dockerConf = confObj;
            dockerConf.type = "al";
            dockerConf.request = "launch";
            dockerConf.name = "docker";
            dockerConf.port = 0;
            dockerConf.server = agentURL;
            dockerConf.authentication = "UserPassword";
            dockerConf.schemaUpdateMode = "Synchronize";
            dockerConf.serverInstance = "NAV";
            dockerConf.startupObjectId = 22;
            dockerConf.tenant = "";
            if (dockerConf.docker === undefined) {
                dockerConf.docker = {};
            }
            dockerConf.docker.NAVVersion = NAVVersion;
            dockerConf.docker.cu = NAVCU;
            dockerConf.docker.local = NAVLocal;
            dockerConf.docker.password = "";
            dockerConf.docker.username = "admin";
            dockerConf.docker.name = "";
        }
        let request = require('request');
        const reqOptions = {
            uri: agentURL + "/api/docker",
            method: "POST",
            body: {
                "Version": NAVVersion,
                "CU": NAVCU,
                "Local": NAVLocal
            },
            json: true
        };
        request(reqOptions, function (error, response, body) {
            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                return;
            }
            if (response.statusCode !== 202) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }
            let serverConfigs = config.get('configurations');
            serverConfigs.forEach(function (sc, index, object) {
                if (sc.name === "docker") {
                    serverConfigs.splice(index, 1);
                }
            });
            dockerConf.docker.password = body.password;
            dockerConf.port = body.devport;
            dockerConf.docker.name = body.name;
            serverConfigs.push(dockerConf);
            config.update('configurations', serverConfigs);
            console.log(body);
        });
        // Display a message box to the user
        this.copyPassword();
    }
    static removeInstance() {
        console.log('Starting Remove Instance');
        const agentURL = "http://dyn.jcdhotel.dk";
        const editor = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let serverConfigs = config.get('configurations');
        let confObj = serverConfigs.find(obj => {
            return obj.name === "docker";
        });
        let dockerConf;
        if (confObj !== undefined) {
            dockerConf = confObj;
        }
        else {
            return;
        }
        let request = require('request');
        const reqOptions = {
            uri: agentURL + "/api/docker",
            method: "DELETE",
            body: {
                "name": dockerConf.docker.name
            },
            json: true
        };
        request(reqOptions, function (error, response, body) {
            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                return;
            }
            if (response.statusCode !== 200) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }
            let serverConfigs = config.get('configurations');
            serverConfigs.forEach(function (sc, index, object) {
                if (sc.name === "docker") {
                    serverConfigs.splice(index, 1);
                }
            });
            config.update('configurations', serverConfigs);
        });
    }
    static copyPassword() {
        const editor = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('launch', editor.document.uri);
        let serverConfigs = config.get('configurations');
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
exports.default = default_1;
//# sourceMappingURL=instanceHandler.js.map