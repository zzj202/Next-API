// @ts-ignore
import {NextApiRequest, NextApiResponse} from "next";
import {fetchEventSource} from "@fortaine/fetch-event-source";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    const messages = [
        {
            role: 'user',
            content: '你好'
        }
    ]
    const modelConfig = {
        model: 'gpt-3.5-turbo',
    }
    const requestPayload = {
        messages,
        stream: true,
        model: 'gpt-3.5-turbo',
    }
    console.log("[Request] openai payload: ", requestPayload);
    const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        headers: {
            "Content-Type": "application/json",
            "x-requested-with": "XMLHttpRequest",
            "Authorization": "Bearer "+"sk-69T6IRXe1xLXzO2tOnl2T3Blb" + "kFJO02e3c5YoTxeiQt66fAu"
        }
    }

    let responseText = "";
    let finished = false;


    fetchEventSource('https://api.openai.com/v1/chat/completions', {
        ...chatPayload,
        async onopen(res) {
            const contentType = res.headers.get("content-type");
            console.log(
                "[OpenAI] request response content type: ",
                contentType,
            );
            console.log(res)
        },
        onmessage(msg) {
            console.log(msg)
        }
    })
}
