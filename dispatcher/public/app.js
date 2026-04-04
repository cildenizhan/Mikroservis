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
function initChart() {
    chartContainer.innerHTML = '';
    for(let i=0; i<barsCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.floor(Math.random() * 80) + 10}%`;
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
    bar.style.height = `${height}%`;
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
});
