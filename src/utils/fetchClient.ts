const host = "https://mixgpt.ru";

export const postAsync = async (url: string, body: any, token: string) : Promise<any> => {
    return fetch(`${host}${url}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
        },
        body: JSON.stringify(body)
    }).then(async response => {
        const content = await response.json();

        if(response.ok){
            return content;
        } else {
            //Обрабатываем ошибку их ответа
            console.log(content);
        }
    });
};

export const postWithStreamingAsync = async (url: string, body: any, token: string, onChunk: (chunk: string, isEnd: boolean) => void, abortController: AbortController) : Promise<any> => {
    fetch(`${host}${url}`, {
        method: "POST",
        signal: abortController.signal,
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    }).then(async (response) => {
        if (!response.body) {
            throw new Error('ReadableStream not supported in this environment.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done){
                onChunk("", true);
                break;
            }
    
            const chunk = decoder.decode(value, { stream: true });
            chunk.split('\n').forEach(line => {
                if (line.startsWith('data:')) {
                    const message = line.replace('data: ', '');

                    if(message !== ""){
                        onChunk(message, false);
                    }  
                }
            });
        }
    });
};

export const getAsync = async (url: string, token: string) : Promise<any> => {
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

        console.log(response.status);
    });
};