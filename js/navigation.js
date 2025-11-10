import { supabase } from '/js/supabase.js'

class NavigationManager {
    constructor() {
        this.init()
    }

    async init() {
        await this.updateNavigation()
        this.setupEventListeners()
    }

    async updateNavigation() {
        const navActions = document.querySelector('.nav-actions')
        if (!navActions) return

        try {
            // Проверяем есть ли авторизованный пользователь
            const { data: { user }, error } = await supabase.auth.getUser()
            
            if (user && !error) {
                // Пользователь авторизован - загружаем профиль
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single()

                const username = profile?.username || user.email
                
                navActions.innerHTML = `
                    <a href="/pages/bookmarks.html" class="icon-btn" title="Закладки">
                        <i class="fas fa-bookmark"></i>
                    </a>
                    <div class="user-menu">
                        <div class="user-info">
                            <span class="user-name">${username}</span>
                            <i class="fas fa-chevron-down" style="margin-left: 5px; font-size: 0.8rem;"></i>
                            <div class="user-dropdown">
                                <a href="/pages/profile.html" class="dropdown-item">
                                    <i class="fas fa-user"></i> Профиль
                                </a>
                                <a href="/pages/settings.html" class="dropdown-item">
                                    <i class="fas fa-cog"></i> Настройки
                                </a>
                                <button class="dropdown-item logout-btn" id="logoutBtn">
                                    <i class="fas fa-sign-out-alt"></i> Выйти
                                </button>
                            </div>
                        </div>
                    </div>
                `
            } else {
                // Пользователь не авторизован
                navActions.innerHTML = `
                    <a href="/pages/bookmarks.html" class="icon-btn" title="Закладки">
                        <i class="fas fa-bookmark"></i>
                    </a>
                    <a href="/pages/login.html" class="icon-btn" title="Войти">
                        <i class="fas fa-sign-in-alt"></i>
                    </a>
                    <a href="/pages/registration.html" class="btn btn-primary">
                        Регистрация
                    </a>
                `
            }
        } catch (error) {
            console.error('Ошибка обновления навигации:', error)
            // В случае ошибки показываем кнопки для неавторизованных
            navActions.innerHTML = `
                <a href="/pages/bookmarks.html" class="icon-btn" title="Закладки">
                    <i class="fas fa-bookmark"></i>
                </a>
                <a href="/pages/login.html" class="icon-btn" title="Войти">
                    <i class="fas fa-sign-in-alt"></i>
                </a>
                <a href="/pages/registration.html" class="btn btn-primary">
                    Регистрация
                </a>
            `
        }
    }

    setupEventListeners() {
        // Обработчик выхода
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault()
                
                try {
                    const { error } = await supabase.auth.signOut()
                    if (error) throw error
                    
                    // Перезагружаем страницу для обновления навигации
                    window.location.reload()
                } catch (error) {
                    console.error('Ошибка при выходе:', error)
                    alert('Ошибка при выходе: ' + error.message)
                }
            }
        })
    }
}

// Инициализация когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager()
})
