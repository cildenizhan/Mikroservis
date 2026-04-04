function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('current-time').innerHTML = 
        `<i class="fa-regular fa-clock"></i> ${now.toLocaleDateString('tr-TR', dateOptions)} - ${now.toLocaleTimeString('tr-TR', timeOptions)} | Sistem Canlı`;
}
setInterval(updateClock, 1000);
updateClock();
const chartContainer = document.getElementById('traffic-chart');
const barsCount = 20;

function getTimeLabel(offsetSeconds) {
    const d = new Date(Date.now() - offsetSeconds * 1000);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getTrafficStatus(rps) {
    if (rps >= 700) return { label: 'Kritik', icon: 'fa-circle-exclamation', cls: 'critical' };
    if (rps >= 400) return { label: 'Yoğun', icon: 'fa-bolt', cls: 'burst' };
    return { label: 'Normal', icon: 'fa-circle-check', cls: 'normal' };
}

function createBarTooltip(rps, timeLabel) {
    const status = getTrafficStatus(rps);
    const tooltip = document.createElement('div');
    tooltip.className = 'bar-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-value">${rps} İstek/sn</div>
        <div class="tooltip-label"><i class="fa-regular fa-clock"></i> ${timeLabel}</div>
        <div class="tooltip-status ${status.cls}"><i class="fa-solid ${status.icon}"></i> ${status.label}</div>
    `;
    return tooltip;
}

function initChart() {
    chartContainer.innerHTML = '';
    for(let i = barsCount - 1; i >= 0; i--) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = Math.floor(Math.random() * 80) + 10;
        const rps = height * 10;
        bar.style.height = `${height}%`;
        bar.appendChild(createBarTooltip(rps, getTimeLabel(i * 3)));
        chartContainer.appendChild(bar);
    }
}

function updateChart() {
    if(chartContainer.children.length === 0) return;
    chartContainer.removeChild(chartContainer.firstChild);
    const bar = document.createElement('div');
    bar.className = 'bar';
    const isBurst = Math.random() > 0.8;
    const height = isBurst ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 40) + 10;
    const rps = height * 10;
    bar.style.height = `${height}%`;
    bar.appendChild(createBarTooltip(rps, getTimeLabel(0)));
    chartContainer.appendChild(bar);
}

initChart();
setInterval(updateChart, 2000);
async function updateMetrics() {
    try {
        const response = await fetch('/api/system-status');
        const data = await response.json();
        const memObj = document.getElementById('disp-mem');
        const cpuObj = document.getElementById('disp-cpu');
        memObj.innerText = `${data.memory.rss}MB`;
        cpuObj.innerText = `${Math.min(100, Math.max(1, (data.loadAverage[0] * 20))).toFixed(1)}%`;
        document.getElementById('avg-latency').innerText = `${Math.floor(Math.random() * 10) + 15}ms`;
        document.getElementById('error-rate').innerText = `${(Math.random() * 0.02).toFixed(2)}%`;
    } catch (e) {
        console.error('Veri cekilemedi', e);
    }
    const services = ['auth', 'prod', 'order'];
    services.forEach(srv => {
        const cpu = Math.floor(Math.random() * 25) + 5;
        const memObj = document.getElementById(`${srv}-mem`);
        let currentMem = parseInt(memObj.innerText.replace('MB', ''));
        const memChange = Math.floor(Math.random() * 11) - 5; 
        currentMem = Math.max(50, currentMem + memChange);
        document.getElementById(`${srv}-cpu`).innerText = `${cpu}%`;
        memObj.innerText = `${currentMem}MB`;
    });
}
setInterval(updateMetrics, 3000);
function triggerRefresh() {
    const btn = document.querySelector('.refresh-btn');
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        btn.style.transition = 'none';
        btn.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            btn.style.transition = 'all 0.3s ease';
        }, 50);
    }, 300);
    updateMetrics();
    initChart();
    refreshLogs();
}
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            tabPanes.forEach(pane => {
                pane.classList.remove('active-tab');
            });
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId)?.classList.add('active-tab');
        });
    });
    refreshLogs();
});

function getStatusBadgeClass(statusCode) {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warning';
    if (statusCode >= 200 && statusCode < 300) return 'success';
    return '';
}

async function refreshLogs() {
    const tbody = document.getElementById('log-table-body');
    try {
        const response = await fetch('/api/logs');
        const logs = await response.json();

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Henüz log kaydı yok.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.reverse().map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const badgeClass = getStatusBadgeClass(log.statusCode);
            return `<tr>
                <td>${time}</td>
                <td><span class="log-method ${log.method.toLowerCase()}">${log.method}</span></td>
                <td class="log-url">${log.url}</td>
                <td><span class="badge ${badgeClass}">${log.statusCode}</span></td>
                <td>${log.responseTime}ms</td>
            </tr>`;
        }).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Loglar yüklenemedi.</td></tr>';
    }
}

setInterval(refreshLogs, 5000);

function toggleSwagger(id) {
    const el = document.getElementById(`swagger-${id}`);
    if (el.classList.contains('expanded')) {
        el.classList.remove('expanded');
    } else {
        el.classList.add('expanded');
    }
}

async function executeApi(method, endpoint, bodyId, resId) {
    const resEl = document.getElementById(resId);
    resEl.innerText = "Yükleniyor...";
    resEl.style.color = "var(--text-secondary)";

    let bodyData = null;
    if (bodyId) {
        try {
            const raw = document.getElementById(bodyId).value;
            bodyData = JSON.parse(raw);
        } catch (e) {
            resEl.innerText = "Hata: Girdiğiniz Request Body geçerli bir JSON değil!";
            resEl.style.color = "var(--danger)";
            return;
        }
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    const tokenInput = document.getElementById('global-token');
    if (tokenInput && tokenInput.value) {
        headers['Authorization'] = `Bearer ${tokenInput.value}`;
    }

    try {
        const start = Date.now();
        const response = await fetch(endpoint, {
            method: method,
            headers: headers,
            body: bodyData ? JSON.stringify(bodyData) : undefined
        });
        const end = Date.now();
        const latency = end - start;

        let data;
        try {
            data = await response.json();
        } catch(e) {
            data = await response.text();
        }

        const isOk = response.ok;
        
        if (isOk && endpoint === '/api/auth/login' && data.token) {
            tokenInput.value = data.token;
        }

        const statusColor = isOk ? 'var(--success)' : 'var(--warning)';
        resEl.style.color = statusColor;
        
        const output = `HTTP Durumu: ${response.status} (${latency}ms)\n\n${JSON.stringify(data, null, 2)}`;
        resEl.innerText = output;

    } catch (err) {
        resEl.style.color = 'var(--danger)';
        resEl.innerText = `Ağ Hatası (Network Error):\n${err.message}`;
    }
}
