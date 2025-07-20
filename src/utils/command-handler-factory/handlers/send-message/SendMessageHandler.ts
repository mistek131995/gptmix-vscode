import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { SendMessageRequest } from "./SendMessageRequest";
import { ChatManager } from "../../../chat-manager/ChatManager";

export class SendMessageHandler implements ICommandHandler{
    async handle(request: SendMessageRequest, context: ExtensionContext, webview: Webview) {
        const token = await context.secrets.get("token");
        const chatManager = new ChatManager();

        if(!request.chatId){
            request.chatId = await chatManager.createChatAsync(request.message, token);

            if(!request.chatId){
                return;
            }

            webview.postMessage({
                command: "updateChatId",
                chatId: request.chatId
            });
        }

        const onChunk = (content: string, role: string, isEnd: boolean) => {
            webview.postMessage({
                chatId: request.chatId,
                command: "putMessage",
                message: content,
                files: request.files.map((file: any) => {return {id: "", name: file.name}}),
                role: role,
                isEnd: isEnd
            });
        };

        await chatManager.sendMessageAsync(request.chatId, request.message, token, onChunk, request.model, request.files);
    }
}