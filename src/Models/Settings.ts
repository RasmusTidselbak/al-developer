import { TestConfig } from "./TestConfig";
import * as vscode from "vscode";

export class SettingsFile {
    public name: string = "UNKNOWN";
    public version?: string;
    public cu?: string;
    public local?: string;
    public tests?: TestConfig[];

    public getName(): string {
        return this.name ? this.name : "UNKNOWN";
    }

    public getVersion(): string {
        return this.version ? this.version : "BC";
    }

    public getCU(): string {
        return this.cu ? this.cu : "";
    }

    public getLocal(): string {
        return this.local ? this.local : "";
    }

    public static defaultSettings(): SettingsFile {
        let settingsFile = new SettingsFile();
        let tests: TestConfig[] = [{
            test: "unittests",
            type: "Codeunit",
            companyName: "CRONUS Danmark A/S",
            codeunitId: "50130",
            methodName: "RunTests"
        }];

        settingsFile.name = "UNKNOWN";
        settingsFile.version = "BC";
        settingsFile.local = "dk";
        settingsFile.tests = tests;

        return settingsFile;
    }

    public static getSettings(): SettingsFile {
        let fs = require('fs');
        let settingsPath: string;
        let folderPath: string;

        const editor = <vscode.TextEditor>vscode.window.activeTextEditor;
        if (editor) {
            const folder = <vscode.WorkspaceFolder>vscode.workspace.getWorkspaceFolder(editor.document.uri);
            folderPath = folder.uri.fsPath;
        } else {
            folderPath = "C:\\Users\\raa\\Documents\\Development\\NAV\\TopCoder\\TopCoder\\test";
        }
        settingsPath = folderPath + '/settings.json';

        if (!fs.existsSync(settingsPath)) {
            settingsPath = folderPath + '/../settings.json';
            if (!fs.existsSync(settingsPath)) {
                return this.defaultSettings();
            }
        }

        let rawdata: any = fs.readFileSync(settingsPath);
        let settingsFile = new SettingsFile();
        JSON.parse(rawdata, (key, value) => {
            switch (key) {
                case 'name':
                    settingsFile.name = value ? value : "";
                    break;

                case 'cu':
                    settingsFile.cu = value ? value : "";
                    break;
                case 'local':
                    settingsFile.local = value ? value : "";
                    break;
                case 'version':
                    settingsFile.version = value ? value : "";
                    break;
                default:
                    break;
            }
        });

        return settingsFile;
    }
}