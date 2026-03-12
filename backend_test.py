import requests
import sys
import time
from datetime import datetime

class EsfihariaAPITester:
    def __init__(self, base_url="https://pedidos-esfiharia.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.text:
                    try:
                        return response.json()
                    except:
                        return response.text
                return {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}")
                return {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_seed_products(self):
        """Test seeding products"""
        result = self.run_test("Seed Products", "GET", "products/seed", 200)
        if result:
            print(f"   Message: {result.get('message', 'N/A')}")
        return result

    def test_get_products(self):
        """Test getting all products"""
        result = self.run_test("Get Products", "GET", "products", 200)
        if result and isinstance(result, list):
            print(f"   Found {len(result)} products")
            # Verify categories
            categories = set(p.get('category') for p in result)
            expected_categories = {'esfihas', 'bebidas', 'sobremesas'}
            if expected_categories.issubset(categories):
                print(f"   ✅ All categories present: {categories}")
            else:
                print(f"   ❌ Missing categories. Expected: {expected_categories}, Got: {categories}")
        return result

    def test_create_order(self):
        """Test creating an order"""
        order_data = {
            "customer_name": f"Test Customer {datetime.now().strftime('%H%M%S')}",
            "table_number": "5",
            "items": [
                {
                    "product_id": "test-product-1",
                    "name": "Esfiha de Carne",
                    "price": 6.50,
                    "quantity": 2
                },
                {
                    "product_id": "test-product-2", 
                    "name": "Coca-Cola Lata",
                    "price": 6.00,
                    "quantity": 1
                }
            ],
            "total": 19.00
        }
        
        result = self.run_test("Create Order", "POST", "orders", 200, data=order_data)
        if result and result.get('id'):
            self.created_order_id = result['id']
            print(f"   Created order ID: {self.created_order_id}")
            print(f"   Status: {result.get('status')}")
        return result

    def test_get_all_orders(self):
        """Test getting all orders"""
        result = self.run_test("Get All Orders", "GET", "orders", 200)
        if result and isinstance(result, list):
            print(f"   Found {len(result)} orders")
        return result

    def test_get_kitchen_orders(self):
        """Test getting kitchen orders"""
        result = self.run_test("Get Kitchen Orders", "GET", "orders/kitchen", 200)
        if result and isinstance(result, list):
            print(f"   Found {len(result)} kitchen orders")
            pending_count = sum(1 for o in result if o.get('status') == 'pending')
            preparing_count = sum(1 for o in result if o.get('status') == 'preparing')
            print(f"   Pending: {pending_count}, Preparing: {preparing_count}")
        return result

    def test_get_cashier_orders(self):
        """Test getting cashier orders"""
        result = self.run_test("Get Cashier Orders", "GET", "orders/cashier", 200)
        if result and isinstance(result, list):
            print(f"   Found {len(result)} cashier orders")
            ready_count = sum(1 for o in result if o.get('status') == 'ready')
            delivered_count = sum(1 for o in result if o.get('status') == 'delivered')
            print(f"   Ready: {ready_count}, Delivered: {delivered_count}")
        return result

    def test_update_order_status(self):
        """Test updating order status"""
        if not self.created_order_id:
            print("❌ Skipping status update - no order created")
            return {}
            
        # Test updating to preparing
        result = self.run_test(
            "Update Order to Preparing",
            "PATCH",
            f"orders/{self.created_order_id}/status",
            200,
            data={"status": "preparing"}
        )
        
        if result:
            print(f"   Updated status to: {result.get('status')}")
            
            # Test updating to ready
            time.sleep(0.5)  # Brief delay
            result2 = self.run_test(
                "Update Order to Ready",
                "PATCH", 
                f"orders/{self.created_order_id}/status",
                200,
                data={"status": "ready"}
            )
            
            if result2:
                print(f"   Updated status to: {result2.get('status')}")
                
                # Test updating to delivered
                time.sleep(0.5)  # Brief delay
                result3 = self.run_test(
                    "Update Order to Delivered",
                    "PATCH",
                    f"orders/{self.created_order_id}/status", 
                    200,
                    data={"status": "delivered"}
                )
                
                if result3:
                    print(f"   Final status: {result3.get('status')}")
                    return result3
        
        return result

def main():
    print("🚀 Starting Esfiharia API Tests")
    print("=" * 50)
    
    tester = EsfihariaAPITester()
    
    # Run all tests in sequence
    print("\n📋 PRODUCT TESTS")
    tester.test_api_root()
    tester.test_seed_products()
    products = tester.test_get_products()
    
    print("\n📦 ORDER TESTS")
    tester.test_create_order()
    tester.test_get_all_orders()
    tester.test_get_kitchen_orders()
    tester.test_get_cashier_orders()
    
    print("\n🔄 STATUS UPDATE TESTS")
    tester.test_update_order_status()
    
    # Final verification
    print("\n🔍 FINAL VERIFICATION")
    tester.test_get_kitchen_orders()
    tester.test_get_cashier_orders()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())