import { isJsonString } from "./string";
import * as vscode from "vscode";

export const host = "https://mixgpt.ru";

export const postAsync = async (url: string, body: any, token: string | undefined) : Promise<any> => {
    return fetch(`${host}${url}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
        },
        body: JSON.stringify(body)
    }).then(async response => {
        if(response.ok){
            return await response.json();
        }

        vscode.commands.executeCommand("mixgpt.httperror", response);
    }).catch(error => {
        console.log(error);
        vscode.commands.executeCommand("mixgpt.httperror", null);
    });
};

export const postWithStreamingAsync = async (url: string, body: FormData, token: string | undefined, onChunk: (chunk: string, isEnd: boolean) => void, abortController: AbortController) : Promise<any> => {
    fetch(`${host}${url}`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
            "authorization": `Bearer ${token}`
        },
        body: body
    }).then(async (response) => {
        if (!response.body) {
            vscode.commands.executeCommand("mixgpt.httperror", response);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();

            if (done){
                onChunk("{}", true);
                break;
            }
    
            const chunk = decoder.decode(value, { stream: true });

            chunk.split('data: ').forEach(line => {
                if (line && isJsonString(line)){
                    onChunk(line, false);
                }
            });
        }
    });
};

export const getAsync = async (url: string, token: string|undefined) : Promise<any> => {
    return await fetch(`${host}${url}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
        },
    }).then(async (response) => {
        if(response.ok){
            return await response.json();
        }

        vscode.commands.executeCommand("mixgpt.httperror", response);
    });
};

export const deleteAsync = async(url: string, token: string|undefined) : Promise<any> => {
    return fetch(`${host}${url}`, {
        method: "DELETE",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
        },
    }).then(async (response) => {
        if(response.ok){
            return await response.json();
        }

        vscode.commands.executeCommand("mixgpt.httperror", response);
    });
};