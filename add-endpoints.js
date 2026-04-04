const fs = require('fs');

const endpoints = [
    { group: 'auth', method: 'post', path: '/api/auth/register', desc: 'Yeni kullanıcı kaydı oluştur.', body: '{"username": "testuser", "email": "test@test.com", "password": "password123"}' },
    { group: 'auth', method: 'post', path: '/api/auth/login', desc: 'Kullanıcı girişi yap ve Token al.', body: '{"username": "testuser", "password": "password123"}' },
    { group: 'auth', method: 'get', path: '/api/auth/users', desc: 'Sistemdeki kullanıcıları listele (Admin).' },
    { group: 'auth', method: 'get', path: '/api/auth/users/1', desc: 'Belirli bir kullanıcıyı getir.' },
    { group: 'auth', method: 'delete', path: '/api/auth/users/1', desc: 'Kullanıcı sil (Admin).' },
    
    { group: 'prod', method: 'get', path: '/api/products', desc: 'Tüm ürünleri listele.' },
    { group: 'prod', method: 'post', path: '/api/products', desc: 'Sisteme yeni ürün ekle. (Auth Token)', body: '{"name": "Laptop", "price": 15000, "stock": 10}' },
    { group: 'prod', method: 'get', path: '/api/products/1', desc: 'Tekil ürün detayını getir.' },
    { group: 'prod', method: 'put', path: '/api/products/1', desc: 'Ürünü güncelle. (Auth Token)', body: '{"name": "Laptop Premium", "price": 18000, "stock": 5}' },
    { group: 'prod', method: 'delete', path: '/api/products/1', desc: 'Ürün sil. (Auth Token)' },

    { group: 'ord', method: 'get', path: '/api/orders', desc: 'Tüm siparişleri listele. (Auth Token)' },
    { group: 'ord', method: 'post', path: '/api/orders', desc: 'Yeni sipariş oluştur. (Auth Token)', body: '{"productId": "1", "quantity": 2}' },
    { group: 'ord', method: 'get', path: '/api/orders/1', desc: 'Tekil sipariş getir. (Auth Token)' },
    { group: 'ord', method: 'put', path: '/api/orders/1', desc: 'Sipariş durumunu güncelle. (Auth Token)', body: '{"status": "shipped"}' },
    { group: 'ord', method: 'delete', path: '/api/orders/1', desc: 'Siparişi iptal et. (Auth Token)' }
];

let html = '<div class="swagger-list">\n';

endpoints.forEach((ep, idx) => {
    const id = `${ep.group}-${ep.method}-${idx}`;
    html += `
        <div class="swagger-item ${ep.method}">
            <div class="swagger-header" onclick="toggleSwagger('${id}')">
                <span class="method ${ep.method}">${ep.method.toUpperCase()}</span>
                <span class="endpoint">${ep.path}</span>
                <span class="desc">${ep.desc}</span>
            </div>
            <div class="swagger-body" id="swagger-${id}">
                <div class="swagger-input">
                    ${ep.body ? `<label>Request Body (JSON)</label>
                    <textarea id="body-${id}">${ep.body}</textarea>` : `<p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">Gövde (Body) gerektirmez.</p>`}
                    <button class="try-btn execute" onclick="executeApi('${ep.method.toUpperCase()}', '${ep.path}', ${ep.body ? `'body-${id}'` : 'null'}, 'res-${id}')">Test Et (Execute)</button>
                </div>
                <div class="swagger-output">
                    <label>Response</label>
                    <pre id="res-${id}">Sonuç bekleniyor...</pre>
                </div>
            </div>
        </div>
    `;
});
html += '</div>';

let indexHtml = fs.readFileSync('dispatcher/public/index.html', 'utf8');
const startTag = '<div class="swagger-list">';
const startIdx = indexHtml.indexOf(startTag);
if (startIdx === -1) {
    console.error("Bulunamadi startTag");
    process.exit(1);
}

const perfIdx = indexHtml.indexOf('<div id="tab-performance"');
if (perfIdx === -1) {
    console.error("Bulunamadi tab-performance");
    process.exit(1);
}

const head = indexHtml.substring(0, startIdx);
const tail = indexHtml.substring(perfIdx);

const finalHtml = head + html + '\n                    </div>\n                </div>\n                ' + tail;

fs.writeFileSync('dispatcher/public/index.html', finalHtml);
console.log("HTML OK!");
