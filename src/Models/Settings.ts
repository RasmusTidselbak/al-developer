import { TestConfig } from "./TestConfig";
import * as vscode from "vscode";

export interface SettingsFile {
    name?: string;
    version?: string;
    cu?: string;
    local?: string;
    tests?: TestConfig[];
    backup?: string;
    image?: string;
}

export class SettingsMethods {

    public static defaultSettings(): SettingsFile {
        let settingsFile: SettingsFile = {};
        // let tests: TestConfig[] = [{
        //     test: "unittests",
        //     type: "Codeunit",
        //     companyName: "CRONUS Danmark A/S",
        //     codeunitId: "50130",
        //     methodName: "RunTests"
        // }];

        settingsFile.name = "UNKNOWN";
        // settingsFile.version = "BC";
        // settingsFile.local = "dk";
        // settingsFile.tests = tests;

        return settingsFile;
    }

    public static getSettings(): SettingsFile {
        let fs = require('fs');
        let settingsPath: string | undefined = this.settingsFolder();


        if (!settingsPath) {
            return this.defaultSettings();
        }

        let rawdata: any = fs.readFileSync(settingsPath);
        try {
            let jsonData:SettingsFile = JSON.parse(rawdata);
            return jsonData;
        } catch (error) {
            console.log(error);
            vscode.window.showErrorMessage("Could not read settingsfile, got the following error: " + error);
            throw error;
        }
    }

    public static settingsFolder(): string | undefined {
        const fs = require('fs');
        let settingsPath: string;
        let folderPath: string = this.getRootFolderPath();
        settingsPath = folderPath + '/settings.json';

        if (!fs.existsSync(settingsPath)) {
            settingsPath = folderPath + '/../settings.json';
            if (!fs.existsSync(settingsPath)) {
                return undefined;
            }
        }
        return settingsPath;
    }

    static async validateSettings(_settings: SettingsFile) {
        if (!_settings.version && !_settings.image) {
            const error = "Could not read settingsfile, please verify that it exists."
            vscode.window.showErrorMessage(error);
            throw error;
        }
    }


    static defaultSettingsPath(): string {
        let rootFolder = this.getRootFolderPath();
        return rootFolder + '/settings.json';
    }

    static getRootFolderPath(): string {
        const editor = <vscode.TextEditor>vscode.window.activeTextEditor;
        if (editor) {
            const folder = <vscode.WorkspaceFolder>vscode.workspace.getWorkspaceFolder(editor.document.uri);
            if (folder) {
                return folder.uri.fsPath;
            } else {
                return require('path').dirname(editor.document.uri.fsPath);
            }
        } else {
            return "C:\\Users\\raa\\Documents\\Development\\NAV\\TopCoder\\TopCoder\\test";
        }
    }

    static async saveSettings(settingsFile: SettingsFile) {
        const fs = require('fs');
        let settingsPath: string | undefined = this.settingsFolder();

        if (fs.existsSync(settingsPath)) {
            let rawdata: any = fs.readFileSync(settingsPath);
            let _settings = JSON.parse(rawdata);
            _settings.version = settingsFile.version;
            if (settingsFile.cu) {
                _settings.cu = settingsFile.cu;
            }
    
            if (settingsFile.local) {
                _settings.local = settingsFile.local;
            }
            
            if (settingsFile.image) {
                _settings.image = settingsFile.image;
            }
    
            fs.writeFileSync(settingsPath, JSON.stringify(_settings, null, 2));
        } else {
            fs.writeFileSync(this.defaultSettingsPath(), JSON.stringify(settingsFile, null, 2));
        }
    }
}