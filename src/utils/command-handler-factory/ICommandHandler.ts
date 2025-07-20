import * as vscode from "vscode";

export interface ICommandHandler{
    handle(request: any, context: vscode.ExtensionContext, webview: vscode.Webview): any
}