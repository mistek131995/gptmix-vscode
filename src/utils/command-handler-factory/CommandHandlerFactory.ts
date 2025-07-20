import { DeleteChatHandler } from "./handlers/delete-chat/DeleteChatHandler";
import { GetChatListHandler } from "./handlers/get-chat-list/GetChatListHandler";
import { GetHomeHandler } from "./handlers/get-home/GetHomeHandler";
import { LoginInHandler } from "./handlers/login-in/LoginInHandler";
import { LoginOutHandler } from "./handlers/login-out/LoginOutHandler";
import { SendMessageHandler } from "./handlers/send-message/SendMessageHandler";
import { StopStreamingHandler } from "./handlers/stop-streaming/StopStreamingHandler";
import { ICommandHandler } from "./ICommandHandler";
import * as vscode from "vscode";

export class CommandHandlerFactory{
    private handlers: Record<string, ICommandHandler>;

    constructor(){
        this.handlers = {
            loginIn: new LoginInHandler(),
            loginOut: new LoginOutHandler(),
            getChatList: new GetChatListHandler(),
            getHome: new GetHomeHandler(),
            deleteChat: new DeleteChatHandler(),
            stopStreaming: new StopStreamingHandler(),
            sendMessage: new SendMessageHandler()
        };
    }

    handlMessage(message: {type: string, data: any}, context: vscode.ExtensionContext, webview: vscode.Webview){
        const handler = this.handlers[message.type];

        if (!handler) {
            throw new Error(`Обработчик с типом "${message.type}" не найден`);
        }
                
        handler.handle(message.data, context, webview);
    }
}