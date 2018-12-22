import * as vscode from "vscode";
import { ServerConfig } from "../../Models/ServerConfig";

export default class {
    public static newInstance(serverConf: ServerConfig) {
        let request = require('request');
        let agentURL = vscode.workspace.getConfiguration().get("aldev.dockerAgentURL", "http://localhost");
        const reqOptions =
        {
            uri: agentURL + "/api/docker",
            method: "POST",
            body: {
                "Version": serverConf.docker.NAVVersion,
                "CU": serverConf.docker.cu,
                "Local": serverConf.docker.local
            },
            json: true

        };

        request(reqOptions, function (error: any, response: any, body: any) {

            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
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

            console.log(body);
        });
    }

    public static removeInstance(serverConf: ServerConfig) {

        let request = require('request');
        let agentURL = vscode.workspace.getConfiguration().get("aldev.dockerAgentURL", "http://localhost");

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

            if (error !== undefined && error !== null) {
                vscode.window.showErrorMessage('Failed to read the content. Error: ' + error);
                return;
            }
            if (response.statusCode !== 200) {
                vscode.window.showErrorMessage('Failed to read the content. Status code ' + response.statusCode + ' and body: ' + body);
                return;
            }

        });
    }
}