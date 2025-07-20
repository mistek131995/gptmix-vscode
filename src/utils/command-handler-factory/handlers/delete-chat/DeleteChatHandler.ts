import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { ChatManager } from "../../../chat-manager/ChatManager";

export class DeleteChatHandler implements ICommandHandler{
    async handle(request: any, context: ExtensionContext, webview: Webview) {
        const chatManager = new ChatManager();
        const token = await context.secrets.get("token");
    }
}