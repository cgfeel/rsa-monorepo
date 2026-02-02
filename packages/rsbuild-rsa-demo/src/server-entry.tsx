import { renderToPipeableStream } from "react-dom/server";
import App from "./server/App.tsx";
import { type Response } from "express";

export async function renderRSC(_: unknown, res: Response) {
    try {
        const { pipe } = renderToPipeableStream(<App />, {
            onShellReady() {
                res.setHeader("Content-Type", "text/x-component");
                res.setHeader("Cache-Control", "no-cache");
                pipe(res);
            },
            onError(err) {
                console.error("RSC渲染错误", err);
                res.status(500).send(err instanceof Error ? `RSC渲染失败：${err.message}` : "RSC渲染失败");
            },
        });
    } catch (error) {
        console.error("RSC初始化错误：", error);
        res.status(500).send(error instanceof Error ? `初始化失败：${error.message}` : "初始化失败");
    }
}
