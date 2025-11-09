import { supabase } from './supabase.js'

async function createUserProfile(userId, username, email) {
  try {
    console.log('👤 Creating profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username: username,
          full_name: username,
          email: email
        }
      ])
      .select()

    if (error) {
      console.error('❌ Profile creation failed:', error);
      throw error;
    }
    
    console.log('✅ Profile created successfully:', data[0]);
    return { success: true, profile: data[0] };
    
  } catch (error) {
    console.error('🚨 Profile creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    // 1. Регистрируем пользователя в Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          full_name: username
        }
      }
    });
    
    if (error) {
      console.error('❌ Auth registration failed:', error);
      throw error;
    }

    console.log('✅ User registered in Auth:', data.user);

    // 2. Создаем профиль в таблице profiles
    const profileResult = await createUserProfile(data.user.id, username, email);
    
    if (!profileResult.success) {
      console.warn('⚠️ User registered but profile creation failed');
      // Все равно возвращаем успех, т.к. пользователь создан
      return { success: true, user: data.user, profileWarning: true };
    }

    console.log('✅ Registration completed successfully!');
    return { 
      success: true, 
      user: data.user, 
      profile: profileResult.profile 
    };
    
  } catch (error) {
    console.error('🚨 Registration error:', error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    console.log('🔧 Attempting login...', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
    
    console.log('✅ Login successful:', data.user);
    return { success: true, user: data.user };
    
  } catch (error) {
    console.error('🚨 Login error:', error);
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
    
    console.log('✅ Logout successful');
    return { success: true };
    
  } catch (error) {
    console.error('🚨 Logout error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return { success: true, user: user };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
