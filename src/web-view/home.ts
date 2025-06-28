import * as vscode from 'vscode';

export const getHomeHtml = async (context: vscode.ExtensionContext, webviewView: vscode.Webview) => {
  const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'html', 'home.html');

  const cssUri = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'css', 'main.css')
  );

  const jsUri = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'scripts', 'home.js')
  );

  const markedJs = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'scripts', 'marked.js')
  );

  const loginOutIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'door-open.svg')
  );

  const newChatIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'plus-lg.svg')
  );

  const chatListIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'list-ul.svg')
  );

  const sendMessageIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'arrow-right.svg')
  );

  const stopStreamingIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'stop.svg')
  );

  const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
  let htmlContent = Buffer.from(htmlBytes).toString('utf8');

  return htmlContent = htmlContent
  .replace(/{{cspSource}}/g, webviewView.cspSource)
  .replace(/{{cssUri}}/g, cssUri.toString())
  .replace(/{{jsUri}}/g, jsUri.toString())
  .replace(/{{markedJs}}/g, markedJs.toString())
  .replace(/{{loginOutIcon}}/g, loginOutIcon.toString())
  .replace(/{{newChatIcon}}/g, newChatIcon.toString())
  .replace(/{{chatListIcon}}/g, chatListIcon.toString())
  .replace(/{{sendMessageIcon}}/g, sendMessageIcon.toString())
  .replace(/{{stopStreamingIcon}}/g, stopStreamingIcon.toString());
};