// Добавляем эти функции в существующий script.js

// Функция для обработки покупки
function buyMod(modType) {
    // Проверяем авторизацию
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    
    if (!user) {
        alert('Для покупки необходимо войти в аккаунт');
        window.location.href = 'login.html?redirect=purchase.html?mod=' + modType;
        return;
    }
    
    // Перенаправляем на страницу покупки
    window.location.href = 'purchase.html?mod=' + modType;
}

// Обновляем функцию selectMod на главной странице
function selectMod(modType) {
    const mods = {
        'basic': { name: 'RustMe Basic', price: 99 },
        'lite': { name: 'RustMe Lite', price: 89 },
        'legit': { name: 'RustMe Legit', price: 79 },
        'full': { name: 'RustMe Full', price: 199 }
    };
    
    const mod = mods[modType];
    if (mod) {
        if (confirm(`Выбрать: ${mod.name}\nЦена: ${mod.price}₽/месяц\n\nПерейти к покупке?`)) {
            buyMod(modType);
        }
    }
}

// Функция для связи с Telegram
function contactTelegram(context = '') {
    const message = context || 'Здравствуйте! У меня есть вопрос по RustMe Client';
    const telegramUrl = `https://t.me/dadepbabki?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
}

// Функция для проверки статуса подписки
function checkSubscriptionStatus() {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return null;
    
    const subscriptions = user.subscriptions || [];
    const now = new Date();
    
    for (const sub of subscriptions) {
        if (sub.expires && new Date(sub.expires) > now) {
            return {
                active: true,
                type: sub.type,
                expires: sub.expires,
                daysLeft: Math.ceil((new Date(sub.expires) - now) / (1000 * 60 * 60 * 24))
            };
        }
    }
    
    return { active: false };
}

// Функция для генерации реферальной ссылки
function generateReferralLink() {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return null;
    
    const baseUrl = window.location.origin;
    const refCode = btoa(user.username).substring(0, 8);
    return `${baseUrl}/ref=${refCode}`;
}

// Функция для покупки через Telegram
function purchaseViaTelegram(modType, period = '30') {
    const mods = {
        'full': { name: 'RustMe Full', price: 199 },
        'basic': { name: 'RustMe Basic', price: 99 },
        'legit': { name: 'RustMe Legit', price: 79 },
        'lite': { name: 'RustMe Lite', price: 89 }
    };
    
    const mod = mods[modType];
    if (!mod) return;
    
    let price = mod.price;
    if (period === '90') price = Math.round(mod.price * 2.7 * 0.9);
    if (period === '180') price = Math.round(mod.price * 6 * 0.8);
    if (period === '365') price = Math.round(mod.price * 12 * 0.7);
    
    const message = `Хочу купить ${mod.name}\nСрок: ${period} дней\nСумма: ${price}₽\nКак оплатить?`;
    const telegramUrl = `https://t.me/dadepbabki?text=${encodeURIComponent(message)}`;
    
    window.open(telegramUrl, '_blank');
}

// Функция для обновления цены при выборе периода
function updatePurchasePrice(modType, period) {
    const prices = {
        'full': 199,
        'basic': 99,
        'legit': 79,
        'lite': 89
    };
    
    let price = prices[modType] || 199;
    
    if (period === '90') price = Math.round(price * 2.7 * 0.9);
    if (period === '180') price = Math.round(price * 6 * 0.8);
    if (period === '365') price = Math.round(price * 12 * 0.7);
    
    return price;
}

// Добавляем обработчик для кнопок "Купить" на главной странице
document.addEventListener('DOMContentLoaded', function() {
    // Обновляем обработчики кнопок покупки
    document.querySelectorAll('[onclick^="selectMod"]').forEach(button => {
        const oldOnClick = button.getAttribute('onclick');
        const modType = oldOnClick.match(/selectMod\('(\w+)'\)/)[1];
        button.setAttribute('onclick', `buyMod('${modType}')`);
    });
    
    // Добавляем кнопку Telegram в навигацию
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.querySelector('.telegram-nav-link')) {
        const telegramLink = document.createElement('a');
        telegramLink.href = 'https://t.me/dadepbabki';
        telegramLink.target = '_blank';
        telegramLink.className = 'nav-link telegram-nav-link';
        telegramLink.innerHTML = '<i class="fab fa-telegram"></i> Поддержка';
        navLinks.appendChild(telegramLink);
    }
});

// Функция для создания заказа
function createOrder(modType, period, paymentMethod) {
    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const price = updatePurchasePrice(modType, period);
    
    const order = {
        id: orderId,
        mod: modType,
        period: period,
        price: price,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 час на оплату
    };
    
    // Сохраняем заказ
    let orders = JSON.parse(localStorage.getItem('rustme_orders')) || [];
    orders.push(order);
    localStorage.setItem('rustme_orders', JSON.stringify(orders));
    
    return order;
}

// Функция для проверки статуса заказа
function checkOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('rustme_orders')) || [];
    return orders.find(order => order.id === orderId);
}

// Функция для обновления статуса заказа
function updateOrderStatus(orderId, status) {
    let orders = JSON.parse(localStorage.getItem('rustme_orders')) || [];
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('rustme_orders', JSON.stringify(orders));
        return true;
    }
    
    return false;
}