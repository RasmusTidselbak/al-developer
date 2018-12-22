import * as vscode from "vscode";
import * as fs from 'fs';

class ManifestHandler{

    public static createGUID(): string {
        const uuidv4 = require('uuid/v4');
        return uuidv4();
    }
}

export default function (): any {

    let mainAppPath = vscode.workspace.rootPath + "\\..\\app\\app.json";
    let testAppPath = vscode.workspace.rootPath + "\\..\\test\\app.json";
    let storeChanges: boolean = false;

    let rawdata: any = fs.readFileSync(mainAppPath);
    let mainAppFile = JSON.parse(rawdata);

    if (mainAppFile.id === "<APP ID>") {
        mainAppFile.id = ManifestHandler.createGUID();
        storeChanges = true;

        fs.writeFileSync(mainAppPath, JSON.stringify(mainAppFile, null, 2));
    }

    rawdata = fs.readFileSync(testAppPath);
    let testAppFile = JSON.parse(rawdata);

    if (testAppFile.id === "<APP ID>") {
        testAppFile.id = ManifestHandler.createGUID();
        storeChanges = true;
    }

    testAppFile.dependencies.forEach((dependency: any) => {
        if ((dependency.appId === "<APP ID>") || (dependency.appId === mainAppFile.id)) {
            storeChanges = true;
            dependency.appId = mainAppFile.id;
            dependency.name = mainAppFile.name;
            dependency.publisher = mainAppFile.publisher;
            dependency.version = mainAppFile.version;
        }
    });

    if (storeChanges) {
        fs.writeFileSync(testAppPath, JSON.stringify(testAppFile, null, 2));
    }
}