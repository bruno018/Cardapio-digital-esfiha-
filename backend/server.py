from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERED = "delivered"

class ProductCategory(str, Enum):
    ESFIHAS = "esfihas"
    BEBIDAS = "bebidas"
    SOBREMESAS = "sobremesas"

# Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: ProductCategory
    image_url: str

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    table_number: str
    items: List[CartItem]
    total: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    table_number: str
    items: List[CartItem]
    total: float
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    items: Optional[List[CartItem]] = None
    total: Optional[float] = None
    
    # Products endpoints
@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str):
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/seed")
async def seed_products():
    """Seed initial products"""
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Products already seeded", "count": existing}
    
    products = [
        # Esfihas de Carne
        {"id": str(uuid.uuid4()), "name": "Esfiha de Carne", "description": "Tradicional esfiha de carne moída temperada", "price": 6.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1588798571170-5e9df66a6c1d?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha de Carne com Queijo", "description": "Carne moída com queijo mussarela derretido", "price": 7.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1588798571170-5e9df66a6c1d?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha de Calabresa", "description": "Calabresa fatiada com cebola", "price": 7.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1588798571170-5e9df66a6c1d?w=400"},
        # Esfihas de Frango
        {"id": str(uuid.uuid4()), "name": "Esfiha de Frango", "description": "Frango desfiado temperado", "price": 6.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1669908978664-485e69bc26cd?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha de Frango com Catupiry", "description": "Frango com catupiry cremoso", "price": 7.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1669908978664-485e69bc26cd?w=400"},
        # Esfihas de Queijo
        {"id": str(uuid.uuid4()), "name": "Esfiha de Queijo", "description": "Queijo mussarela derretido", "price": 6.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1669908978664-485e69bc26cd?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha 4 Queijos", "description": "Mussarela, provolone, parmesão e catupiry", "price": 8.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1669908978664-485e69bc26cd?w=400"},
        # Esfihas Especiais
        {"id": str(uuid.uuid4()), "name": "Esfiha Beirute", "description": "Carne, queijo, tomate e orégano", "price": 8.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1498654364264-5e856b6bb047?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha Vegetariana", "description": "Legumes frescos e queijo", "price": 7.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1498654364264-5e856b6bb047?w=400"},
        # Bebidas
        {"id": str(uuid.uuid4()), "name": "Coca-Cola Lata", "description": "350ml gelada", "price": 6.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1595898186839-ce52e86ee6ec?w=400"},
        {"id": str(uuid.uuid4()), "name": "Guaraná Antarctica", "description": "350ml gelado", "price": 5.50, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1595898186839-ce52e86ee6ec?w=400"},
        {"id": str(uuid.uuid4()), "name": "Suco de Laranja", "description": "Natural 300ml", "price": 8.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1595898186839-ce52e86ee6ec?w=400"},
        {"id": str(uuid.uuid4()), "name": "Água Mineral", "description": "500ml sem gás", "price": 4.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1595898186839-ce52e86ee6ec?w=400"},
        {"id": str(uuid.uuid4()), "name": "Água com Gás", "description": "500ml", "price": 4.50, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1595898186839-ce52e86ee6ec?w=400"},
        # Sobremesas
        {"id": str(uuid.uuid4()), "name": "Esfiha de Chocolate", "description": "Recheio cremoso de chocolate", "price": 7.00, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1770748556866-cc14c8d31490?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha de Doce de Leite", "description": "Doce de leite argentino", "price": 7.00, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1770748556866-cc14c8d31490?w=400"},
        {"id": str(uuid.uuid4()), "name": "Esfiha de Banana com Canela", "description": "Banana caramelizada com canela", "price": 7.50, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1770748556866-cc14c8d31490?w=400"},
        {"id": str(uuid.uuid4()), "name": "Pudim", "description": "Pudim de leite condensado", "price": 10.00, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1770748556866-cc14c8d31490?w=400"},
    ]
    
    await db.products.insert_many(products)
    return {"message": "Products seeded successfully", "count": len(products)}

# Orders endpoints
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    order = Order(
        customer_name=order_data.customer_name,
        table_number=order_data.table_number,
        items=[item.model_dump() for item in order_data.items],
        total=order_data.total
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_all_orders():
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.get("/orders/kitchen", response_model=List[Order])
async def get_kitchen_orders():
    """Get orders for kitchen (pending and preparing)"""
    orders = await db.orders.find(
        {"status": {"$in": ["pending", "preparing"]}},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.get("/orders/cashier", response_model=List[Order])
async def get_cashier_orders():
    """Get orders for cashier (ready and delivered)"""
    orders = await db.orders.find(
        {"status": {"$in": ["ready", "delivered"]}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.patch("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    update_data = {"status": status_update.status.value}
    if status_update.items is not None:
        update_data["items"] = [item.model_dump() for item in status_update.items]
    if status_update.total is not None:
        update_data["total"] = status_update.total
    
    result = await db.orders.find_one_and_update(
        {"id": order_id},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(result['created_at'], str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    
    return result

@api_router.get("/")
async def root():
    return {"message": "Esfiharia API running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
