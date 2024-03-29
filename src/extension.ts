'use strict';
import * as vscode from 'vscode';
import mh from "./Components/manifestHandler";
import ih from "./Components/instanceHandler";

export function activate(context: vscode.ExtensionContext) {
    console.log('activating');

    let newInstDisp = vscode.commands.registerCommand('aldev.newInstance', ih.newInstance);
    context.subscriptions.push(newInstDisp);

    let removeInstDisp = vscode.commands.registerCommand('aldev.removeInstance', ih.removeInstance);
    context.subscriptions.push(removeInstDisp);

    let startInstDisp = vscode.commands.registerCommand('aldev.startInstance', ih.startInstance);
    context.subscriptions.push(startInstDisp);

    let stopInstDisp = vscode.commands.registerCommand('aldev.stopInstance', ih.stopInstance);
    context.subscriptions.push(stopInstDisp);

    let restartInstDisp = vscode.commands.registerCommand('aldev.restartInstance', ih.restartInstance);
    context.subscriptions.push(restartInstDisp);

    let clearInstDisp = vscode.commands.registerCommand('aldev.clearInstance', ih.clearInstance);
    context.subscriptions.push(clearInstDisp);

    let generateSymbolsDisp = vscode.commands.registerCommand('aldev.generateSymbols', ih.generateSymbols);
    context.subscriptions.push(generateSymbolsDisp);
    
    let createBackupDisp = vscode.commands.registerCommand('aldev.commitImage', ih.commitImage);
    context.subscriptions.push(createBackupDisp);

    let openSettingsDisp = vscode.commands.registerCommand('aldev.openSettings', ih.openSettings );
    context.subscriptions.push(openSettingsDisp);

    let initializeDisp = vscode.commands.registerCommand('aldev.updateAppManifest', mh );
    context.subscriptions.push(initializeDisp);

    // context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(ih.getInstanceStatus));
}

export function deactivate() {
}
