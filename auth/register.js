import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Временное хранилище (замени на реальную БД позже)
let users = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    }

    // Проверка существующего пользователя
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Создание пользователя
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      profile: {
        firstName: '',
        lastName: '',
        avatar: '',
        bio: '',
        favorites: []
      }
    };

    // Сохранение пользователя
    users.push(newUser);

    // Создание JWT токена
    const token = jwt.sign(
      { userId: newUser.id }, 
      process.env.JWT_SECRET || 'fallback-secret', 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profile: newUser.profile
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
