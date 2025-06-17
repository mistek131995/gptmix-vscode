import * as vscode from 'vscode';
import { getLoginInHtml } from './web-view/loginIn';
import { getHomeHtml } from './web-view/home';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('webviewSidebar', {
      async resolveWebviewView(webviewView) {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources')
          ]
        };

        if(await context.secrets.get("token")){
          webviewView.webview.html = await getHomeHtml(context, webviewView.webview);
        }else{
          webviewView.webview.html = await getLoginInHtml(context, webviewView.webview);
        }


        webviewView.webview.onDidReceiveMessage(async (message) => {
          if(message.command === "login-success"){
            webviewView.webview.html = await getHomeHtml(context, webviewView.webview);
            await context.secrets.store("token", message.token);
          }
        });
      }
    })
  );
}
