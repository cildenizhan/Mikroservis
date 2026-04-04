const http = require('http');

console.log("\n🚀 MIKROSERVIS YUK VE PERFORMANS TESTI BASLIYOR...");
console.log("Hedef: http://localhost:3000/api/system-status (API Gateway)");
console.log("Simule Edilen Kullanici: Eşzamanlı Yük (Stress Test)\n");

let success = 0;
let errors = 0;
let totalTime = 0;
const requests = 200;

async function makeRequest() {
    return new Promise((resolve) => {
        const start = Date.now();
        http.get('http://localhost:3000/api/system-status', (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                const end = Date.now();
                if (res.statusCode === 200) success++;
                else errors++;
                totalTime += (end - start);
                resolve();
            });
        }).on('error', () => {
            errors++;
            resolve();
        });
    });
}

async function run() {
    process.stdout.write("Testler kosuluyor: [");
    const promises = [];
    for (let i = 0; i < requests; i++) {
        promises.push(makeRequest());
        if (i % 10 === 0) process.stdout.write("=");
    }
    await Promise.all(promises);
    console.log("] Bitti!\n");

    console.log("==========================================");
    console.log("📊 API GATEWAY (DISPATCHER) TEST SONUÇLARI");
    console.log("==========================================");
    console.log(`✅ Basarili Istek    : ${success}`);
    console.log(`❌ Basarisiz Istek   : ${errors}`);
    console.log(`⏱ Ortalama Gecikme  : ${(totalTime / requests).toFixed(2)} ms`);
    console.log(`⚡ Basari Orani      : %${((success / requests) * 100).toFixed(2)}`);
    console.log("==========================================\n");
}

run();
