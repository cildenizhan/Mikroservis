import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // 30 saniyede 50 kullanıcıya çık
        { duration: '1m', target: 50 },   // 1 dakika boyunca 50 kullanıcıda kal
        { duration: '30s', target: 0 },   // 30 saniyede 0 kullanıcıya in
    ],
};

const BASE_URL = 'http://localhost:3000'; // Sadece Dispatcher dışarıya açık

export default function () {
    // 1. Health Kontrolü
    let res = http.get(`${BASE_URL}/api/health`);
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    
    // Yük testinde test veritabanını şişirmemek adına POST/PUT operasyonlarından çok GET yapıyoruz
    // Gerçek bir kullanıcı rastgele gecikmeler yaşayabilir
    sleep(1);
}
