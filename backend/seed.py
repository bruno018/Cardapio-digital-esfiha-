import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://UserCEO:UserCEO2026bv@esfiharia.62bjkbd.mongodb.net/"
DB_NAME = "esfiharia"

produtos = [
    # ESFIHAS
    {"name": "Esfiha de Carne", "description": "Tradicional esfiha de carne moída temperada", "price": 6.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=400"},
    {"name": "Esfiha de Carne com Queijo", "description": "Carne moída com queijo mussarela derretido", "price": 7.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"},
    {"name": "Esfiha de Calabresa", "description": "Calabresa fatiada com cebola", "price": 7.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400"},
    {"name": "Esfiha de Frango", "description": "Frango desfiado temperado", "price": 6.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400"},
    {"name": "Esfiha de Frango com Catupiry", "description": "Frango com catupiry cremoso", "price": 7.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1628191081676-8d0e7cc9a3c9?w=400"},
    {"name": "Esfiha de Queijo", "description": "Queijo mussarela derretido", "price": 6.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1548340748-6fe353b5ef55?w=400"},
    {"name": "Esfiha 4 Queijos", "description": "Mussarela, provolone, parmesão e catupiry", "price": 8.50, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400"},
    {"name": "Esfiha Beirute", "description": "Carne, queijo, tomate e orégano", "price": 8.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400"},
    {"name": "Esfiha Vegetariana", "description": "Legumes frescos e queijo", "price": 7.00, "category": "esfihas", "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"},
    # BEBIDAS
    {"name": "Coca-Cola Lata", "description": "350ml gelada", "price": 6.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400"},
    {"name": "Guaraná Antarctica", "description": "350ml gelado", "price": 5.50, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400"},
    {"name": "Suco de Laranja", "description": "Natural 300ml", "price": 8.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400"},
    {"name": "Água Mineral", "description": "500ml sem gás", "price": 4.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"},
    {"name": "Água com Gás", "description": "500ml", "price": 4.50, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400"},
    # SOBREMESAS
    {"name": "Esfiha de Chocolate", "description": "Recheio cremoso de chocolate", "price": 7.00, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400"},
    {"name": "Esfiha de Doce de Leite", "description": "Doce de leite argentino", "price": 7.00, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400"},
    {"name": "Esfiha de Banana com Canela", "description": "Banana caramelizada com canela", "price": 7.50, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400"},
    {"name": "Pudim", "description": "Pudim de leite condensado", "price": 10.00, "category": "sobremesas", "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400"},
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    await db.products.delete_many({})
    await db.products.insert_many(produtos)
    print(f"✅ {len(produtos)} produtos cadastrados com sucesso!")
    client.close()

asyncio.run(seed())