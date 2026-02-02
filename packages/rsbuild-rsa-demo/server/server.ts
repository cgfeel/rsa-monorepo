import { createRsbuild, loadConfig, logger, RsbuildDevServer } from "@rsbuild/core";
import express, { Response } from 'express'

const serverRender = (serverAPI: RsbuildDevServer) => async (_: unknown, res: Response) => {
    const indexModule = await serverAPI.environments.node.loadBundle<ServerEntryModule>('index')
    const markup = indexModule.render()

    const template = await serverAPI.environments.web.getTransformedHtml('index')
    const html = template.replace('<!--app-content-->', markup)
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    
    res.end(html);
}

export async function startDevServer() {
    const { content } = await loadConfig()

    // Init Rsbuild
    const rsbuild = await createRsbuild({
        rsbuildConfig: content
    })

    const app = express()

    // Create Rsbuild DevServer instance
    const rsbuildServer = await rsbuild.createDevServer()
    const serverRenderMiddleware = serverRender(rsbuildServer)

    // 1. 先挂载 SSR 路由（/ 必须在 Rsbuild 中间件之前）
    app.get('/', async (req, res, next) => {
        try {
            await serverRenderMiddleware(req, res)
        } catch (err) {
            logger.error('SSR render error, downgrade to CSR')
            logger.error(err)
            next()
        }
    })

    // 2. 应用 Rsbuild 内置中间件（包含 HMR 中间件）
    app.use(rsbuildServer.middlewares)

    // 3. 监听 HTTP 端口
    const httpServer = app.listen(rsbuildServer.port, () => {
        // 4. 关键：连接 WebSocket（这是 HMR 生效的关键！）
        rsbuildServer.connectWebSocket({ server: httpServer });

        // 5. 通知 Rsbuild 服务器已启动
        rsbuildServer.afterListen();
        logger.info(`Server running at http://localhost:${rsbuildServer.port}`);
    })

    return {
        close: async () => {
            await rsbuildServer.close()
            httpServer.close()
        }
    }
}

startDevServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

// 定义 index 入口模块的导出类型
interface ServerEntryModule {
  // 对应 render() 方法，返回 HTML 片段（同步/异步均可）
  render: () => string
}