import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://UserCEO:UserCEO2026bv@esfiharia.62bjkbd.mongodb.net/"
DB_NAME = "esfiharia"

produtos = [
    # ESFIHAS
    {"name": "Esfiha de Carne", "description": "Tradicional esfiha de carne moída temperada", "price": 6.50, "category": "esfihas", "image_url": "https://i.ibb.co/0pbcC0H0/esfiiha-de-carne.jpg"},
    {"name": "Esfiha de Carne com Queijo", "description": "Carne moída com queijo mussarela derretido", "price": 7.50, "category": "esfihas", "image_url": "https://i.ibb.co/F4hNRJ1b/esfiha-de-carne-e-queijo.png"},
    {"name": "Esfiha de Calabresa", "description": "Calabresa fatiada com cebola", "price": 7.00, "category": "esfihas", "image_url": "https://i.ibb.co/B5L64wnP/esfiha-de-calabresa.jpg"},
    {"name": "Esfiha de Frango", "description": "Frango desfiado temperado", "price": 6.50, "category": "esfihas", "image_url": "https://i.ibb.co/JwtSJ39H/esfiha-de-frango.png"},
    {"name": "Esfiha de Frango com Catupiry", "description": "Frango com catupiry cremoso", "price": 7.50, "category": "esfihas", "image_url": "https://i.ibb.co/k2jHSqHX/esfiha-frango-catupiry.jpg"},
    {"name": "Esfiha de Queijo", "description": "Queijo mussarela derretido", "price": 6.00, "category": "esfihas", "image_url": "https://i.ibb.co/xTzhvjL/esfiha-de-queijo.jpg"},
    {"name": "Esfiha 4 Queijos", "description": "Mussarela, provolone, parmesão e catupiry", "price": 8.50, "category": "esfihas", "image_url": "https://i.ibb.co/60wGsNBh/esfiha-4-queijo.jpg"},
    {"name": "Beirute", "description": "Carne, queijo, tomate e orégano", "price": 8.00, "category": "esfihas", "image_url": "https://i.ibb.co/BVjWg4Tk/beirute.png"},
    {"name": "Esfiha Vegetariana", "description": "Legumes frescos e queijo", "price": 7.00, "category": "esfihas", "image_url": "https://i.ibb.co/MxDR1Qw2/esfiha-vegetariana.jpg"},
    # BEBIDAS
    {"name": "Coca-Cola Lata", "description": "350ml gelada", "price": 6.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400"},
    {"name": "Guaraná Antarctica", "description": "350ml gelado", "price": 5.50, "category": "bebidas", "image_url": "https://i.ibb.co/F4kqNrXz/lata-guarana-antartica.png"},
    {"name": "Suco de Laranja", "description": "Natural 300ml", "price": 8.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400"},
    {"name": "Água Mineral", "description": "500ml sem gás", "price": 4.00, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"},
    {"name": "Água com Gás", "description": "500ml", "price": 4.50, "category": "bebidas", "image_url": "https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400"},
    # SOBREMESAS
    {"name": "Esfiha de Chocolate", "description": "Recheio cremoso de chocolate", "price": 7.00, "category": "sobremesas", "image_url": "https://i.ibb.co/cSDyhCJQ/esfiha-de-chocolate-com-confeti.png"},
    {"name": "Esfiha de Doce de Leite", "description": "Doce de leite argentino", "price": 7.00, "category": "sobremesas", "image_url": "https://i.ibb.co/nqcKthJ2/esfiha-de-doce-de-leite.png"},
    {"name": "Esfiha de Banana com Canela", "description": "Banana caramelizada com canela", "price": 7.50, "category": "sobremesas", "image_url": "https://i.ibb.co/5gRwhy29/esfiha-de-banana-com-canela.png"},
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    await db.products.delete_many({})
    await db.products.insert_many(produtos)
    print(f"✅ {len(produtos)} produtos cadastrados com sucesso!")
    client.close()

asyncio.run(seed())