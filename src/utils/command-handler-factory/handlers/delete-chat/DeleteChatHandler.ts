import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { ChatManager } from "../../../chat-manager/ChatManager";
import { DeleteChatRequest } from "./DeleteChatRequest";

export class DeleteChatHandler implements ICommandHandler{
    async handle(request: DeleteChatRequest, context: ExtensionContext, webview: Webview) {
        const chatManager = new ChatManager();
        const token = await context.secrets.get("token");

        const result = await chatManager.deleteChatAsync(request.chatId, token);

        if(result){
            webview.postMessage({ 
                command: "getChatListResult",
                data: await chatManager.getChatList(token)
            });
        }
    }
}