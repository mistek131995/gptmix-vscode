import * as vscode from 'vscode';
import { getLoginInHtml } from './web-view/loginIn';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('webviewSidebar', {
      async resolveWebviewView(webviewView) {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'css')
          ]
        };

        const html = await getLoginInHtml(context, webviewView.webview);
        console.log(html);

        webviewView.webview.html = html;
      }
    })
  );
}
