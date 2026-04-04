import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
    stages: [
        { duration: '30s', target: 50 },  
        { duration: '1m', target: 50 },   
        { duration: '30s', target: 0 },   
    ],
};
const BASE_URL = 'http://localhost:3000'; 
export default function () {
    let res = http.get(`${BASE_URL}/api/health`);
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    sleep(1);
}
