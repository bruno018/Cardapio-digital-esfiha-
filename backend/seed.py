import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "esfiharia"

produtos = [
    {"nome": "Esfiha de Carne", "descricao": "Esfiha aberta com carne temperada", "preco": 8.90, "categoria": "Esfihas", "imagem": "🥙"},
    {"nome": "Esfiha de Frango", "descricao": "Esfiha aberta com frango desfiado", "preco": 8.90, "categoria": "Esfihas", "imagem": "🥙"},
    {"nome": "Esfiha de Queijo", "descricao": "Esfiha aberta com queijo derretido", "preco": 7.90, "categoria": "Esfihas", "imagem": "🥙"},
    {"nome": "Esfiha de Calabresa", "descricao": "Esfiha aberta com calabresa", "preco": 8.90, "categoria": "Esfihas", "imagem": "🥙"},
    {"nome": "Coca-Cola", "descricao": "Lata 350ml", "preco": 6.00, "categoria": "Bebidas", "imagem": "🥤"},
    {"nome": "Suco de Laranja", "descricao": "Suco natural 300ml", "preco": 7.00, "categoria": "Bebidas", "imagem": "🥤"},
    {"nome": "Pudim", "descricao": "Pudim de leite condensado", "preco": 9.90, "categoria": "Sobremesas", "imagem": "🍮"},
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    await db.produtos.delete_many({})
    await db.produtos.insert_many(produtos)
    print("✅ Banco populado com sucesso!")
    client.close()

asyncio.run(seed())