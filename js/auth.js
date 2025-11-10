// auth.js
import { supabase } from './supabase.js'

// Функция регистрации
export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) throw error;

    console.log('✅ User registered:', data.user);

    // Создание профиля с повторными попытками
    let profileCreated = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!profileCreated && attempts < maxAttempts) {
      try {
        console.log(`🎯 Creating profile attempt ${attempts + 1} for user:`, data.user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username,
            email: email,
            created_at: new Date().toISOString()
          })
          .select();

        if (profileError) {
          console.error(`❌ Profile creation attempt ${attempts + 1} failed:`, profileError);
          attempts++;
          
          // Ждем перед повторной попыткой
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        console.log('✅ Profile created:', profileData);
        profileCreated = true;
        return { success: true, user: data.user, profile: profileData };
        
      } catch (profileError) {
        console.error(`❌ Profile creation attempt ${attempts + 1} error:`, profileError);
        attempts++;
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!profileCreated) {
      throw new Error('Не удалось создать профиль после нескольких попыток');
    }
    
  } catch (error) {
    console.error('🚨 Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Функция входа
export async function loginUser(email, password) {
  try {
    console.log('🔐 Attempting login...', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('✅ Login successful:', data.user);
    
    // Проверяем существует ли профиль
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('⚠️ Profile not found, creating one...');
      
      // Создаем профиль если его нет
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: data.user.email.split('@')[0],
          email: data.user.email,
          created_at: new Date().toISOString()
        });

      if (createError) {
        console.error('❌ Failed to create profile on login:', createError);
      } else {
        console.log('✅ Profile created on login');
      }
    }

    return { success: true, user: data.user };

  } catch (error) {
    console.error('🚨 Login error:', error);
    return { success: false, error: error.message };
  }
}

// Функция выхода
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout error:', error);
}

// Функция для создания профиля если его нет
export async function ensureProfileExists(user) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      console.log('🔄 Creating missing profile for user:', user.id);
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email.split('@')[0],
          email: user.email,
          created_at: new Date().toISOString()
        });

      if (createError) {
        throw createError;
      }
      
      console.log('✅ Missing profile created');
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error ensuring profile exists:', error);
    return { success: false, error: error.message };
  }
}
