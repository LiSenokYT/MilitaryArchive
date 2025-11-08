export default async function handler(request) {
  return new Response(JSON.stringify({ 
    message: 'API работает!',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
