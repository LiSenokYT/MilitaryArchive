export default function handler(req, res) {
  res.json({ message: "Hello! API works!", timestamp: new Date().toISOString() });
}
