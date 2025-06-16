import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new SimpleTreeDataProvider();
  vscode.window.registerTreeDataProvider('simpleSidebarView', treeDataProvider);
}

class SimpleTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    if (!element) {
      // Корень - пустой список или с одним элементом
      return [new vscode.TreeItem("Привет, это элемент дерева")];
    }
    return [];
  }
}
