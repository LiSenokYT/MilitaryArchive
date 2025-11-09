import { supabase } from './supabase.js'

async function protectProfile() {
  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  
  // Если пользователь не авторизован - перенаправляем на вход
  if (!user) {
    window.location.href = '/login.html'
    return
  }
  
  // Если авторизован - загружаем данные профиля
  loadUserProfile(user)
}

async function loadUserProfile(user) {
  try {
    // Получаем данные профиля из таблицы profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Profile load error:', error)
      return
    }

    // Обновляем информацию на странице
    updateProfilePage(user, profile)
    
  } catch (error) {
    console.error('🚨 Profile error:', error)
  }
}

function updateProfilePage(user, profile) {
  // Обновляем заголовок
  const title = document.querySelector('.profile-title')
  if (title) {
    title.textContent = `Профиль: ${profile?.username || user.email}`
  }
  
  // Обновляем информацию пользователя
  const userInfo = document.getElementById('userInfo')
  if (userInfo) {
    userInfo.innerHTML = `
      <div class="info-item">
        <strong>Email:</strong> ${user.email}
      </div>
      <div class="info-item">
        <strong>Имя пользователя:</strong> ${profile?.username || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Дата регистрации:</strong> ${new Date(user.created_at).toLocaleDateString('ru-RU')}
      </div>
      <div class="info-item">
        <strong>ID:</strong> ${user.id}
      </div>
    `
  }
}

// Запускаем защиту при загрузке страницы
document.addEventListener('DOMContentLoaded', protectProfile)

// Слушаем изменения авторизации
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/login.html'
  }
})
