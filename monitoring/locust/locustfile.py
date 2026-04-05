from locust import HttpUser, task, between
import json
import random

class MikroservisUser(HttpUser):
    """Mikroservis sistemine yük testi yapan kullanıcı simülasyonu"""
    
    wait_time = between(0.5, 2)
    host = "http://dispatcher:3000"
    token = None

    def on_start(self):
        """Her kullanıcı başladığında register + login yaparak token al"""
        username = f"locust_user_{random.randint(1, 999999)}"
        
        # Register
        self.client.post("/api/auth/register", json={
            "username": username,
            "email": f"{username}@test.com",
            "password": "test123456"
        }, name="/api/auth/register")

        # Login ve token al
        response = self.client.post("/api/auth/login", json={
            "username": username,
            "password": "test123456"
        }, name="/api/auth/login")

        try:
            data = response.json()
            self.token = data.get("token", None)
        except:
            self.token = None

    def _headers(self):
        """Auth header'ı döndür"""
        if self.token:
            return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        return {"Content-Type": "application/json"}

    # ─── Health & System ───
    @task(5)
    def health_check(self):
        """API Gateway health kontrolü"""
        self.client.get("/api/health", name="/api/health")

    @task(2)
    def system_status(self):
        """Sistem metrikleri"""
        self.client.get("/api/system-status", name="/api/system-status")

    # ─── Auth Service ───
    @task(3)
    def get_users(self):
        """Kullanıcı listesi"""
        self.client.get("/api/auth/users", headers=self._headers(), name="/api/auth/users")

    # ─── Product Service ───
    @task(10)
    def get_products(self):
        """Ürün listesini çek (en sık yapılan istek)"""
        self.client.get("/api/products", headers=self._headers(), name="/api/products")

    @task(3)
    def create_product(self):
        """Yeni ürün oluştur"""
        product = {
            "name": f"Test Urun {random.randint(1, 10000)}",
            "price": random.randint(10, 5000),
            "stock": random.randint(1, 100)
        }
        self.client.post("/api/products", json=product, headers=self._headers(), name="/api/products [POST]")

    # ─── Order Service ───
    @task(6)
    def get_orders(self):
        """Sipariş listesini çek"""
        self.client.get("/api/orders", headers=self._headers(), name="/api/orders")

    @task(4)
    def create_order(self):
        """Yeni sipariş oluştur"""
        order = {
            "productId": str(random.randint(1, 50)),
            "userId": "locust-test-user",
            "quantity": random.randint(1, 5),
            "totalPrice": random.randint(100, 10000)
        }
        self.client.post("/api/orders", json=order, headers=self._headers(), name="/api/orders [POST]")

    # ─── Logs ───
    @task(1)
    def get_logs(self):
        """Son logları çek"""
        self.client.get("/api/logs", name="/api/logs")


class StressTestUser(HttpUser):
    """Sadece okuma istekleri yapan stres testi kullanıcısı"""
    
    wait_time = between(0.1, 0.5)
    host = "http://dispatcher:3000"
    weight = 1
    token = None

    def on_start(self):
        username = f"stress_user_{random.randint(1, 999999)}"
        self.client.post("/api/auth/register", json={
            "username": username, "email": f"{username}@test.com", "password": "test123456"
        }, name="/api/auth/register")
        response = self.client.post("/api/auth/login", json={
            "username": username, "password": "test123456"
        }, name="/api/auth/login")
        try:
            self.token = response.json().get("token", None)
        except:
            self.token = None

    def _headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        return {"Content-Type": "application/json"}

    @task(10)
    def rapid_health(self):
        self.client.get("/api/health", name="/api/health")

    @task(5)
    def rapid_products(self):
        self.client.get("/api/products", headers=self._headers(), name="/api/products")

    @task(3)
    def rapid_orders(self):
        self.client.get("/api/orders", headers=self._headers(), name="/api/orders")
