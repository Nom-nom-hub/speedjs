import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow, TerminalWindow } from '../../components/code-window'

export default function ApiRoutes(props: any) {
  return (
    <DocsLayout currentPath="/docs/api-routes">
      <div class="section-label">Docs / API Routes</div>
      <h1>API Routes</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Co-locate your backend endpoints with your frontend code. API routes live in <code>src/routes/api/</code> and export handler functions.
      </p>

      <h2>Creating an API route</h2>
      <CodeWindow title="src/routes/api/health.ts">{`export function GET(): Response {
  return new Response(
    JSON.stringify({ status: 'ok', version: '0.1.0' }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}`}</CodeWindow>

      <h2>HTTP methods</h2>
      <CodeWindow title="users.ts">{`export function GET(req: Request): Response {
  // GET /api/users
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json()
  // POST /api/users
}

export function DELETE(req: Request): Response {
  // DELETE /api/users/:id
}`}</CodeWindow>

      <h2>Dynamic API routes</h2>
      <CodeWindow title="api/users/[id].ts">{`import { type RouteParams } from '@speedjs/router'

export function GET(req: Request, params: RouteParams): Response {
  const user = getUserById(params.id)
  return Response.json(user)
}`}</CodeWindow>

      <h2>Best practices</h2>
      <ul>
        <li>Use <code>Response.json()</code> for JSON APIs.</li>
        <li>Return proper status codes — <code>201</code> for creation, <code>204</code> for deletion, <code>404</code> for not found.</li>
        <li>Validate request bodies before processing. Speed.js works great with zod.</li>
        <li>Use <code>speed routes</code> to verify your API endpoints are discovered correctly.</li>
      </ul>

      <h2>CRUD example</h2>
      <CodeWindow title="api/items.ts">{`const items: string[] = []

export function GET(): Response {
  return Response.json(items)
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json()
  items.push(body.name)
  return Response.json({ items }, { status: 201 })
}`}</CodeWindow>
    </DocsLayout>
  )
}
