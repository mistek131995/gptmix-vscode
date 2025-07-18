import * as vscode from 'vscode';
import { getLoginInHtml } from './web-view/loginIn';
import { getHomeHtml } from './web-view/home';
import { getChatListHtml } from './web-view/chatList';
import { ChatManager } from './utils/chatManager/chatManager';

export function activate(context: vscode.ExtensionContext) {
  const chatManager = new ChatManager();
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


      webviewView.webview.onDidReceiveMessage(async (message) => {
        if(message.command === "getChatList")
        {
          const token = await context.secrets.get("token");

          if(token){
            webviewView.webview.html = await getChatListHtml(context, webviewView.webview);

            webviewView.webview.postMessage({ 
              command: "getChatListResult",
              data: await chatManager.getChatList(token)
            });
          }
        }
        else if(message.command === "getHome")
        {
          const token = await context.secrets.get("token");

          if(token){
            webviewView.webview.html = await getHomeHtml(context, webviewView.webview);

            var result = await chatManager.getChatAsync(message.chatId, token);

            if(result){
              webviewView.webview.postMessage({
                command: "getHomeResult",
                chatId: message.chatId,
                messages: result.messages,
                models: result.models
              });
            }
          }
        }
        else if(message.command === "loginIn")
        {
           webviewView.webview.html = await getHomeHtml(context, webviewView.webview);
           await context.secrets.store("token", message.token);

           var result = await chatManager.getChatAsync(message.chatId, message.token);

           if(result){
            webviewView.webview.postMessage({
              command: "getHomeResult",
              chatId: message.chatId,
              messages: result.messages,
              models: result.models
            });
          }
        }
        else if(message.command === "loginOut")
        {
          webviewView.webview.html = await getLoginInHtml(context, webviewView.webview);
          await context.secrets.delete("token");
        }
        else if(message.command === "apiError")
        {
          await apiExceptionHandler(context, webviewView, message);
        }
        else if(message.command === "showToast")
        {
          if(message.type === "info"){
            vscode.window.showInformationMessage(message.message);
          } else {
            vscode.window.showErrorMessage(message.message);
          }
        } 
        else if(message.command === "fetchExplainCode") //Объяснение кода (всегда в новом чате)
        {
          const token = await context.secrets.get('token');

          if(token){
            var result = await chatManager.getChatAsync(undefined, token);

            if(result){
              webviewView.webview.postMessage({
                command: "getHomeResult",
                chatId: message.chatId,
                messages: result.messages,
                models: result.models
              });
            }


            const onChunk = (message: string, role: string, isEnd: boolean) => {
              webviewView.webview.postMessage({
                command: "putMessage",
                message: message,
                role: role,
                isEnd: isEnd
              });
            };

            //Возможно чат лучше создавать до перехода на WebView и передавать Id при переходе.
            const chatId = await chatManager.createChatAsync(message.message, token);
            webviewView.webview.postMessage({
              command: "updateChatId",
              chatId: chatId
            });


            await chatManager.sendMessageAsync(chatId, message.message, token, onChunk);
          }
        } 
        else if(message.command === "sendMessage")
        {
          const token = await context.secrets.get('token');

          if(token){
            if(!message.chatId){
              message.chatId = await chatManager.createChatAsync(message.message, token);

              if(!message.chatId){
                return;
              }

              webviewView.webview.postMessage({
                command: "updateChatId",
                chatId: message.chatId
              });
            }

            const onChunk = (content: string, role: string, isEnd: boolean) => {
              webviewView.webview.postMessage({
                chatId: message.chatId,
                command: "putMessage",
                message: content,
                files: message.files.map((file: any) => {return {id: "", name: file.name}}),
                role: role,
                isEnd: isEnd
              });
            };

            await chatManager.sendMessageAsync(message.chatId, message.message, token, onChunk, message.model, message.files);
          }
        }
        else if(message.command === "stopStreaming")
        {
          chatManager.abortStreaming(message.chatId);
        }
        else if(message.command === "deleteChat")
        {
          const token = await context.secrets.get("token");

          if(token){
            const result = await chatManager.deleteChatAsync(message.chatId, token);

            if(result){
              webviewView.webview.postMessage({ 
                command: "getChatListResult",
                data: await chatManager.getChatList(token)
              });
            }
          }
        }
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

    const response = await data.json() as { message: string };

    if(data.status === 401){
      vscode.window.showErrorMessage("GPTMix: Ошибка аутентификации");
      currentWebviewView.webview.html = await getLoginInHtml(context, currentWebviewView.webview);
      await context.secrets.delete("token");
    } 
    else if(data.status === 404){
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