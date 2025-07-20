import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { getLoginInHtml } from "../../../../web-view/loginIn";

export class LoginOutHandler implements ICommandHandler{
    async handle(request: any, context: ExtensionContext, webview: Webview) {
          webview.html = await getLoginInHtml(context, webview);
          await context.secrets.delete("token");
    } 
}