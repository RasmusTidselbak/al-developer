import { TestConfig } from "./TestConfig";
import * as vscode from "vscode";

export interface SettingsFile {
    name?: string;
    version?: string;
    cu?: string;
    local?: string;
    tests?: TestConfig[];

}

export class SettingsMethods {

    public static defaultSettings(): SettingsFile {
        let settingsFile: SettingsFile = {};
        let tests: TestConfig[] = [{
            test: "unittests",
            type: "Codeunit",
            companyName: "CRONUS Danmark A/S",
            codeunitId: "50130",
            methodName: "RunTests"
        }];

        settingsFile.name = "UNKNOWN";
        // settingsFile.version = "BC";
        // settingsFile.local = "dk";
        settingsFile.tests = tests;

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

    static async validateSettings(_settings: SettingsFile) {
        if (!_settings.version) {
            await this.pickVersion().then((value) => {
                _settings.version = value ? value : "";
            });
            if (!_settings.cu) {
                await this.pickCU().then((value) => {
                    _settings.cu = value ? value : "";
                });
            }
            if (!_settings.local) {
                await this.pickLocal().then((value) => {
                    _settings.local = value ? value : "";
                });
            }
        }
    }

    static async pickVersion(): Promise<string | undefined> {
        const result = await vscode.window.showQuickPick(['BC', '2018'], {
            placeHolder: 'Pick a version',
        });
        return result;
    }
    static async pickCU(): Promise<string | undefined> {
        const result = await vscode.window.showInputBox({ placeHolder: "Pick a cumulative update" });
        return result;
    }
    static async pickLocal(): Promise<string | undefined> {
        const result = await vscode.window.showQuickPick(['DK', 'DE'], {
            placeHolder: 'Pick a localization',
        });
        return result;
    }

    static settingsFolder(): string | undefined {
        const fs = require('fs');
        let settingsPath: string;
        let folderPath: string;

        const editor = <vscode.TextEditor>vscode.window.activeTextEditor;
        if (editor) {
            const folder = <vscode.WorkspaceFolder>vscode.workspace.getWorkspaceFolder(editor.document.uri);
            if (folder) {
                folderPath = folder.uri.fsPath;
            } else {
                folderPath = require('path').dirname(editor.document.uri.fsPath);
            }
        } else {
            folderPath = "C:\\Users\\raa\\Documents\\Development\\NAV\\TopCoder\\TopCoder\\test";
        }
        settingsPath = folderPath + '/settings.json';

        if (!fs.existsSync(settingsPath)) {
            settingsPath = folderPath + '/../settings.json';
            if (!fs.existsSync(settingsPath)) {
                return undefined;
            }
        }
        return settingsPath;
    }

    static async saveSettings(settingsFile: SettingsFile) {
        const fs = require('fs');
        let settingsPath: string | undefined = this.settingsFolder();

        if (!settingsPath) {
            return;
        }

        let rawdata: any = fs.readFileSync(settingsPath);
        let _settings = JSON.parse(rawdata);
        _settings.version = settingsFile.version;
        if (settingsFile.cu) {
            _settings.cu = settingsFile.cu;
        }

        if (settingsFile.local) {
            _settings.local = settingsFile.local;
        }

        fs.writeFileSync(settingsPath, JSON.stringify(_settings, null, 2));
    }
}