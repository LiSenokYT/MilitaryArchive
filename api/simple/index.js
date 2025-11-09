export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({ 
    success: true,
    message: '✅ Simple API is working!',
    timestamp: new Date().toISOString()
  });
}
