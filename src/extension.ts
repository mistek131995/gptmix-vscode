import * as vscode from 'vscode';
import { getLoginInHtml } from './web-view/loginIn';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('webviewSidebar', {
      resolveWebviewView(webviewView) {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources')
          ]
        };

        const cssUri = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'main.css')
        );

        console.log(cssUri.path);

        const cspSource = webviewView.webview.cspSource;

        webviewView.webview.html = getLoginInHtml(cssUri, cspSource);
      }
    })
  );
}
