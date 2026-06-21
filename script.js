document.addEventListener('DOMContentLoaded', () => {
    
    // 1. БАЗА ДАНИХ ТОВАРІВ
    const productsData = {
        "1": { name: "Вовняний блейзер Graphite Luxury", price: 6800, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&width=150&auto=format&fit=crop" },
        "2": { name: "Шкіряні кросівки Urban Run Premium", price: 5400, img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&width=150&auto=format&fit=crop" },
        "3": { name: "Джинси палаццо з японського деніму", price: 3900, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&width=150&auto=format&fit=crop" },
        "4": { name: "Шовкова блуза Pure Silk", price: 4200, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&width=150&auto=format&fit=crop" }
    };

    // НАЛАШТУВАННЯ ТЕЛЕГРАМ-БОТА (Заміни своїми даними)
    const TG_TOKEN = "8110229829:AAGQdUKXXvRtnNvv6_fCQ1gAOUfONw_Lyng"; 
    const TG_CHAT_ID = "1334615761";   

    let cart = JSON.parse(localStorage.getItem('badaboom_cart')) || [];

    // 2. ЕЛЕМЕНТИ ІНТЕРФЕЙСУ (DOM)
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerClose = document.getElementById('cartDrawerClose');
    const cartDrawerItems = document.getElementById('cartDrawerItems');
    const cartTotalSum = document.getElementById('cartTotalSum');
    const btnToTop = document.getElementById('btnToTop');
    const checkoutForm = document.getElementById('checkoutForm');
    const buyButtons = document.querySelectorAll('.buy-btn');

    // 3. МЕНЮ-БУРГЕР
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.remove.classList('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 4. КЕРУВАННЯ ВІКНОМ КОШИКА
    const openCart = () => { if (cartDrawer) { cartDrawer.classList.add('active'); document.body.style.overflow = 'hidden'; } };
    const closeCart = () => { if (cartDrawer) { cartDrawer.classList.remove('active'); document.body.style.overflow = ''; } };

    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCart);
    window.addEventListener('click', (e) => { if (e.target === cartDrawer) closeCart(); });

    // 5. ЛОГІКА ТА РОЗРАХУНКИ КОШИКА
    const saveCartState = () => {
        localStorage.setItem('badaboom_cart', JSON.stringify(cart));
        updateCartUI();
    };

    const updateCartUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        if (!cartDrawerItems || !cartTotalSum) return;

        if (cart.length === 0) {
            cartDrawerItems.innerHTML = `<p class="empty-cart-text" style="text-align: center; padding: 40px 10px; color: #999; font-size: 14px;">Ваш кошик поки що порожній</p>`;
            cartTotalSum.textContent = '0 ₴';
            return;
        }

        let html = '';
        let totalSum = 0;

        cart.forEach(item => {
            totalSum += item.price * item.quantity;
            html += `
                <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 15px; max-width: 65%;">
                        <img src="${item.img}" alt="${item.name}" style="width: 55px; height: 55px; object-fit: cover;">
                        <div>
                            <h5 style="font-size: 13px; font-weight: 500; margin-bottom: 4px; line-height: 1.3;">${item.name}</h5>
                            <span style="font-size: 11px; background: #eee; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-bottom: 4px;">Розмір: ${item.size}</span><br>
                            <span style="font-size: 14px; color: #b89254; font-weight: 600;">${item.price.toLocaleString()} ₴</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="display: flex; align-items: center; border: 1px solid #ccc; background: #fff;">
                            <button class="qty-btn minus" data-cart-id="${item.cartId}" style="border: none; background: none; padding: 4px 10px; cursor: pointer; font-weight: bold;">-</button>
                            <span style="font-size: 13px; min-width: 15px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn plus" data-cart-id="${item.cartId}" style="border: none; background: none; padding: 4px 10px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                        <button class="delete-item-btn" data-cart-id="${item.cartId}" style="background: none; border: none; color: #999; cursor: pointer; font-size: 22px;">&times;</button>
                    </div>
                </div>
            `;
        });

        cartDrawerItems.innerHTML = html;
        cartTotalSum.textContent = `${totalSum.toLocaleString()} ₴`;
    };

    // Делегування подій у кошику
    if (cartDrawerItems) {
        cartDrawerItems.addEventListener('click', (e) => {
            const cartId = e.target.getAttribute('data-cart-id');
            if (!cartId) return;

            const targetItem = cart.find(item => item.cartId === cartId);

            if (e.target.classList.contains('plus') && targetItem) {
                targetItem.quantity += 1;
            } 
            else if (e.target.classList.contains('minus') && targetItem) {
                targetItem.quantity -= 1;
                if (targetItem.quantity <= 0) cart = cart.filter(item => item.cartId !== cartId);
            } 
            else if (e.target.classList.contains('delete-item-btn')) {
                cart = cart.filter(item => item.cartId !== cartId);
            }
            saveCartState();
        });
    }

    // Додавання в кошик із врахуванням розміру
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const product = productsData[id];
            if (!product) return;

            // Находим родительский контейнер товара и забираем выбранный размер
            const wrapper = e.target.closest('[data-product-wrapper]');
            const sizeSelect = wrapper ? wrapper.querySelector('.product-size-select') : null;
            const selectedSize = sizeSelect ? sizeSelect.value : 'M'; // 'M' по дефолту

            const cartId = `${id}_${selectedSize}`; // Составной уникальный ID
            const existingProduct = cart.find(item => item.cartId === cartId);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({
                    cartId: cartId,
                    id: id,
                    name: product.name,
                    price: product.price,
                    img: product.img,
                    size: selectedSize,
                    quantity: 1
                });
            }

            saveCartState();

            // Анимация кнопки
            const originalText = button.textContent;
            button.textContent = 'Додано ✓';
            button.style.backgroundColor = '#b89254';
            button.disabled = true;

            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 1000);

            openCart();
        });
    });

    // 6. НАДІЙНА ВІДПРАВКА В ТЕЛЕГРАМ
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('Будь ласка, додайте хоча б один товар у кошик.');
                return;
            }

            const name = document.getElementById('custName')?.value.trim();
            const phone = document.getElementById('custPhone')?.value.trim();
            const city = document.getElementById('custCity')?.value.trim();
            const office = document.getElementById('custPostOffice')?.value.trim();
            const totalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Формируем текст сообщения для Telegram
            let message = `🛍️ *НОВЕ ЗАМОВЛЕННЯ «BADA BUM»*\n\n`;
            message += `👤 *Клієнт:* ${name}\n`;
            message += `📞 *Телефон:* ${phone}\n`;
            message += `📍 *Доставка:* м. ${city}, НП № ${office}\n\n`;
            message += `📦 *Товари:*\n`;
            
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name} | *Размір: ${item.size}* | ${item.quantity} шт. — ${(item.price * item.quantity).toLocaleString()} ₴\n`;
            });
            
            message += `\n💰 *ЗАГАЛЬНА СУМА:* *${totalSum.toLocaleString()} ₴*`;

            const submitBtn = document.getElementById('submitOrderBtn');
            if (submitBtn) { submitBtn.textContent = 'Відправка...'; submitBtn.disabled = true; }

            // Отправка через API Telegram
            fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TG_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            })
            .then(response => {
                if (!response.ok) throw new Error('Помилка сервера');
                
                alert(`Дякуємо, ${name}!\nВаше замовлення успішно прийнято. Менеджер зв'яжеться з вами.`);
                cart = [];
                saveCartState();
                checkoutForm.reset();
                closeCart();
            })
            .catch(error => {
                console.error(error);
                alert('Сталася помилка при відправці. Будь ласка, спробуйте ще раз або зв\'яжіться з нами по телефону.');
            })
            .finally(() => {
                if (submitBtn) { submitBtn.textContent = 'Підтвердити замовлення'; submitBtn.disabled = false; }
            });
        });
    }

    // 7. КНОПКА "ВГОРУ"
    if (btnToTop) {
        window.addEventListener('scroll', () => {
            btnToTop.style.display = window.scrollY > 450 ? 'flex' : 'none';
        });
        btnToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    updateCartUI();
});