import * as vscode from "vscode";
import { ServerConfig } from "../../Models/ServerConfig";

export default class {
    public static newInstance(serverConf: ServerConfig, callback: Function) {
        let request = require('request');
        let agentURL = vscode.workspace.getConfiguration().get("aldev.dockerAgentURL", "http://localhost");
        let statusdisp = vscode.window.setStatusBarMessage('$(zap) Creating Instance..');
        const reqOptions =
        {
            uri: agentURL + "/api/docker",
            method: "POST",
            body: {
                "Version": serverConf.docker.NAVVersion,
                "CU": serverConf.docker.cu ? "" + serverConf.docker.cu : "0",
                "Local": serverConf.docker.local ? serverConf.docker.local : "w1",
                "Owner": serverConf.docker.owner,
                "Backup": serverConf.docker.backup
            },
            json: true

        };

        request(reqOptions, function (error: any, response: any, body: any) {

            statusdisp.dispose();
            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                console.log(error);
                return;
            }
            if (response.statusCode !== 202) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }
            serverConf.server = agentURL;
            serverConf.docker.password = body.password;
            serverConf.port = body.devport;
            serverConf.docker.name = body.name;
            
            if (body.version.toUpperCase() === "BC15") {
                serverConf.serverInstance = "BC";
            }

            serverConf.docker.clickonce = agentURL + ':' + body.webport + '/' + serverConf.serverInstance + '/';
            serverConf.docker.webclient = agentURL + ':' + body.webclientport + '/' + serverConf.serverInstance + '/';
            serverConf.docker.sqlconnection = agentURL.replace(/(^\w+:|^)\/\//, '') + ',' + body.sqlport + '\\SQLEXPRESS';

            callback(serverConf);
        });
    }


    public static requestAction(action: string, serverConf: ServerConfig, callback: Function) {

        let request = require('request');
        let agentURL = vscode.workspace.getConfiguration().get("aldev.dockerAgentURL", "http://localhost");
        let statusdisp = vscode.window.setStatusBarMessage('$(zap) Action: ' + action);
        const reqOptions =
        {
            uri: agentURL + "/api/Instance",
            method: "POST",
            body: {
                "name": serverConf.docker.name,
                "action": action
            },
            json: true

        };

        request(reqOptions, function (error: any, response: any, body: any) {

            statusdisp.dispose();
            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                return;
            }
            if (response.statusCode !== 202) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }

            callback();

        });
    }

    public static removeInstance(serverConf: ServerConfig, callback: Function) {

        let request = require('request');
        let agentURL = vscode.workspace.getConfiguration().get("aldev.dockerAgentURL", "http://localhost");
        let statusdisp = vscode.window.setStatusBarMessage('$(trashcan) Removing Instance..');
        const reqOptions =
        {
            uri: agentURL + "/api/docker",
            method: "DELETE",
            body: {
                "name": serverConf.docker.name
            },
            json: true

        };

        request(reqOptions, function (error: any, response: any, body: any) {

            statusdisp.dispose();
            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                console.log(error);
                return;
            }
            if (response.statusCode !== 200) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }

            callback();

        });
    }

    public static getInstanceStatus(serverConf: ServerConfig, callback: Function) {
        let request = require('request');
        let agentURL = vscode.workspace.getConfiguration().get("aldev.dockerAgentURL", "http://localhost");
        const reqOptions =
        {
            uri: agentURL + "/api/docker/" + serverConf.docker.name,
            method: "GET",
            json: true

        };

        request(reqOptions, function (error: any, response: any, body: any) {
            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                return;
            }
            if (response.statusCode !== 200) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }
            callback(body.status);

        });
    }
}