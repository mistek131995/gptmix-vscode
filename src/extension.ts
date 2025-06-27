import * as vscode from 'vscode';
import { getLoginInHtml } from './web-view/loginIn';
import { getHomeHtml } from './web-view/home';
import { getChatListHtml } from './web-view/chatList';

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
          webviewView.webview.html = await getChatListHtml(context, webviewView.webview);
        }else{
          webviewView.webview.html = await getLoginInHtml(context, webviewView.webview);
        }


        webviewView.webview.onDidReceiveMessage(async (message) => {
          if(message.command === "getChatList"){
            webviewView.webview.html = await getChatListHtml(context, webviewView.webview);
            webviewView.webview.postMessage({ 
              command: message.command,
              token: await context.secrets.get('token')
            });
          }
          else if(message.command === "getHome"){
            webviewView.webview.html = await getHomeHtml(context, webviewView.webview);
            webviewView.webview.postMessage({ 
              command: message.command,
              chatId: message.chatId,
              token: await context.secrets.get('token')
            });
          }
          else if(message.command === "loginIn")
          {
             webviewView.webview.html = await getHomeHtml(context, webviewView.webview);
             await context.secrets.store("token", message.token);
          }
          else if(message.command === "loginOut")
          {
            webviewView.webview.html = await getLoginInHtml(context, webviewView.webview);
            await context.secrets.delete("token");
          }
          else if(message.command === "apiError")
          {
            console.log("API error")
            await apiExceptionHandler(context, webviewView, message);
          }
          else if(message.code === "showToast")
          {
            if(message.type === "info"){
              vscode.window.showInformationMessage(message.message)
            } else {
              vscode.window.showErrorMessage(message.message);
            }
            
          }
        });
      }
    })
  );
}

const apiExceptionHandler = async(context: vscode.ExtensionContext, webviewView: vscode.WebviewView, message: any) => {
  if(message.code === 401){
    vscode.window.showErrorMessage("GPTMix: Ошибка аутентификации");
    webviewView.webview.html = await getLoginInHtml(context, webviewView.webview);
    await context.secrets.delete("token");
  } 
  else if(message.code === 404){
    webviewView.webview.html = await getChatListHtml(context, webviewView.webview);
  } else if(message.code === 400){
    vscode.window.showInformationMessage(message.message);
  } else if(message.code === 500){
    vscode.window.showErrorMessage("Ошибка сервера");
  }
};