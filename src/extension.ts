import * as vscode from 'vscode';
import { getLoginInHtml } from './web-view/loginIn';
import { getHomeHtml } from './web-view/home';
import { getChatListHtml } from './web-view/chatList';
import { ChatManager } from './utils/chat-manager/ChatManager';
import { CommandHandlerFactory } from './utils/command-handler-factory/CommandHandlerFactory';

export function activate(context: vscode.ExtensionContext) {
  const chatManager = new ChatManager();
  const commandHandlerFactory = new CommandHandlerFactory();
  let currentWebviewView: vscode.WebviewView | undefined;

  const webView = vscode.window.registerWebviewViewProvider('webviewSidebar', {
    async resolveWebviewView(webviewView: vscode.WebviewView) {
      currentWebviewView = webviewView;


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


      webviewView.webview.onDidReceiveMessage(async (command: {type: string, data: any}) => {
        commandHandlerFactory.handlMessage(command, context, webviewView.webview);
      });
    }
  });

  let explainCode = vscode.commands.registerCommand('mixgpt.explaincode', async () => {
    const editor = vscode.window.activeTextEditor;

    if(!editor) {
      return;
    }

    if(editor){
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const token = await context.secrets.get("token");

      if(!token){
        vscode.window.showInformationMessage("Войдите в аккаунт");
        return;
      }

      if(!currentWebviewView){
        vscode.window.showErrorMessage('Не удалось получить WebviewView, обратитесь в техническую поддержку');
        return;
      }

      if(!selectedText){
        vscode.window.showWarningMessage('Выделите код для объяснения');
        return;
      }

      await vscode.commands.executeCommand('workbench.view.extension.webviewSidebarContainer');

      currentWebviewView.webview.html = await getHomeHtml(context, currentWebviewView.webview);
      currentWebviewView.webview.postMessage({
        command: "explainCode",
        message: selectedText
      });
    }
  });

  let httpError = vscode.commands.registerCommand("mixgpt.httperror", async (data: Response) => {
    if(!currentWebviewView){
      return;
    }

    if(!data){
      vscode.window.showErrorMessage("Запрос завершился ошибкой");
      return;
    }

    if(data.status === 401){
      vscode.window.showErrorMessage("GPTMix: Ошибка аутентификации");
      currentWebviewView.webview.html = await getLoginInHtml(context, currentWebviewView.webview);
      await context.secrets.delete("token");
      return;
    }

    const response = await data.json() as { message: string };

    if(data.status === 404){
      currentWebviewView.webview.html = await getChatListHtml(context, currentWebviewView.webview);
    } else if(data.status === 400){
      vscode.window.showInformationMessage(response.message);
    } else if(data.status === 500){
      vscode.window.showErrorMessage("Ошибка сервера");
    }
  });


  context.subscriptions.push(webView);
  context.subscriptions.push(explainCode);
  context.subscriptions.push(httpError);
}