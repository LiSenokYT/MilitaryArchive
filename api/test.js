export default function handler(req, res) {
  res.json({ message: "API работает!", timestamp: new Date().toISOString() });
}
