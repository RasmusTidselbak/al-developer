'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const manifestHandler_1 = require("./Components/manifestHandler");
const instanceHandler_1 = require("./Components/instanceHandler");
function activate(context) {
    console.log('activating');
    let newInstDisp = vscode.commands.registerCommand('aldev.newInstance', instanceHandler_1.default.newInstance);
    context.subscriptions.push(newInstDisp);
    let removeInstDisp = vscode.commands.registerCommand('aldev.removeInstance', instanceHandler_1.default.removeInstance);
    context.subscriptions.push(removeInstDisp);
    let initializeDisp = vscode.commands.registerCommand('aldev.updateAppManifest', manifestHandler_1.default);
    context.subscriptions.push(initializeDisp);
    let copyDisp = vscode.commands.registerCommand('aldev.copyPassword', instanceHandler_1.default.copyPassword);
    context.subscriptions.push(copyDisp);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map