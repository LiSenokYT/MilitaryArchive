import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    res.status(200).json({ 
      success: true, 
      message: '✅ Database connected!',
      time: result[0].now 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: '❌ Database connection failed',
      details: error.message 
    });
  }
}
