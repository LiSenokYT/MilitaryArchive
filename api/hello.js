export default function handler(request) {
  return new Response(JSON.stringify({ 
    message: 'Hello World!',
    working: true 
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
