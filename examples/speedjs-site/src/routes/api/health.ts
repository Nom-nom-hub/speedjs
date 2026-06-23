export function GET(): Response {
  return new Response(JSON.stringify({ status: 'ok', version: '0.1.0' }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
