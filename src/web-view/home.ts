import * as vscode from 'vscode';

export const getHomeHtml = async (context: vscode.ExtensionContext, webviewView: vscode.Webview) => {
  const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'resources', 'html', 'home.html');

  const cssUri = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'css', 'main.css')
  );

  const jsUri = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'scripts', 'home.js')
  );

  const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
  let htmlContent = Buffer.from(htmlBytes).toString('utf8');

  return htmlContent = htmlContent
  .replace(/{{cspSource}}/g, webviewView.cspSource)
  .replace(/{{cssUri}}/g, cssUri.toString())
  .replace(/{{jsUri}}/g, jsUri.toString());
};