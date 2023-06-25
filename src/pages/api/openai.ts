// @ts-ignore
import {NextApiRequest, NextApiResponse} from "next";
import {EventStreamContentType, fetchEventSource} from "@fortaine/fetch-event-source";


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
    const controller = new AbortController();
    const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        headers: {
            "Content-Type": "application/json",
            "x-requested-with": "XMLHttpRequest",
            "Authorization": "Bearer "+"sk-69T6IRXe1xLXzO2tOnl2T3Blb" + "kFJO02e3c5YoTxeiQt66fAu"
        }
    }
    const requestTimeoutId = setTimeout(
        () => controller.abort(),
        60000,
    );

    let responseText = "";
    let finished = false;

    const finish = () => {
        if (!finished) {
            finished = true;
        }
    };

    controller.signal.onabort = finish;
    fetchEventSource('https://api.openai.com/v1/chat/completions', {
        ...chatPayload,
        async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");
            console.log(
                "[OpenAI] request response content type: ",
                contentType,
            );
            if (contentType?.startsWith("text/plain")) {
                responseText = await res.clone().text();
                return finish();
            }
            if (
                !res.ok ||
                !res.headers
                    .get("content-type")
                    ?.startsWith(EventStreamContentType) ||
                res.status !== 200
            ) {
                const responseTexts = [responseText];
                let extraInfo = await res.clone().text();
                try {
                    const resJson = await res.clone().json();
                    extraInfo = prettyObject(resJson);
                } catch {}

                if (res.status === 401) {
                    responseTexts.push("访问密码不正确或为空，请前往[登录](/#/auth)页输入正确的访问密码，或者在[设置](/#/settings)页填入你自己的 OpenAI API Key。");
                }

                if (extraInfo) {
                    responseTexts.push(extraInfo);
                }

                responseText = responseTexts.join("\n\n");

                return finish();
            }
        },
        onmessage(msg) {
            if (msg.data === "[DONE]" || finished) {
                return finish();
            }
            const text = msg.data;
            try {
                const json = JSON.parse(text);
                const delta = json.choices[0].delta.content;
                if (delta) {
                    responseText += delta;
                }
            } catch (e) {
                console.error("[Request] parse error", text, msg);
            }
        },
        onclose() {
            finish();
        },
        onerror(e) {
            throw e;
        },
        openWhenHidden: true,
    })
}

function prettyObject(msg: any) {
    const obj = msg;
    if (typeof msg !== "string") {
        msg = JSON.stringify(msg, null, "  ");
    }
    if (msg === "{}") {
        return obj.toString();
    }
    if (msg.startsWith("```json")) {
        return msg;
    }
    return ["```json", msg, "```"].join("\n");
}
