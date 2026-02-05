import { createRequire } from 'node:module'
import express, { Response } from 'express'
import path from 'node:path'
import fs from 'node:fs'

const port = process.env.PORT || 3000
const require = createRequire(import.meta.url)

const serverRender = (_: unknown, res: Response) => {
    const remotesPath = path.join(process.cwd(), './dist/server/index.js')
    const importedApp = require(remotesPath)

    const markup = importedApp.render()
    const template = fs.readFileSync(`${process.cwd()}/dist/index.html`, "utf-8")
    const html = template.replace('<!--app-content-->', markup)
    res.status(200).set({ "Content-Type": "text/html" }).send(html);
}

export async function preview() {
    const app = express()
    app.get('/', (req, res, next) => {
        try {
            serverRender(req, res)
        } catch (err) {
            console.error("SSR render error, downgrade to CSR...\n", err)
            next()
        }
    })

    app.use(express.static('dist'))
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`)
    })
}

preview()