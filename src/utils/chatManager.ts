import { getAsync, postAsync, postWithStreamingAsync } from "./fetchClient";
import { generateUUID } from "./uuid";

type Message  = {
    id: string,
    content: string,
    role: string,
    model: string,
    created: string
}

type Chat = {
    messages: Message[]
    abortController?: AbortController
}

export class ChatManager{
    private chats: Map<string, Chat> = new Map<string, Chat>();

    async createChatAsync(message: string, token: string, model: string | null = null) : Promise<string>{
        var chatId = await postAsync("/api/v1/chats", {
            message: message,
            isExplain: model === null
        }, token);

        this.chats.set(chatId, {
            messages: []
        });

        return chatId;
    }

    async sendMessageAsync(chatId: string, message: string, token: string, 
        onChunkCallback: (chunk: string, role: string, isEnd: boolean) => void, model: string | null = null)
    {
        const chat = this.chats.get(chatId);

        if(chat){
            const userMessage : Message = {
                id: generateUUID(),
                content: message,
                role: "user",
                model: "",
                created: new Date().toISOString()
            };

            chat.messages.push(userMessage);

            //Отправляем сообщение пользователя для рендера
            onChunkCallback(userMessage.content, "user", true);

            const onChunk = (message: string, isEnd: boolean) => {
                const lastMessage = chat.messages[chat.messages.length - 1];
                lastMessage.content += message;

                onChunkCallback(lastMessage.content, "assistant", isEnd);

                if(isEnd){
                    console.log("update chat");
                    return;
                }

                if(lastMessage && lastMessage.role === "user"){
                    chat.messages.push({
                        id: generateUUID(),
                        content: message,
                        role: "assistant",
                        model: "",
                        created: new Date().toISOString()
                    });

                    return;
                }
            };

            chat.abortController = new AbortController();
            await postWithStreamingAsync("/api/v1/chats/messages", {
                chatId: chatId,
                message: message,
                isExplain: model === null
            }, token, onChunk, chat.abortController);
        }
    }

    async getChatAsync(chatId: string, token: string) : Promise<any>{
        return await getAsync(`/api/v1/chats/${chatId}`, token);
    }

    removeChatAsync(){

    }

    abortStreaming(chatId: string){
        const chat = this.chats.get(chatId);

        if(chat){
            chat.abortController?.abort();
        }
    }
}