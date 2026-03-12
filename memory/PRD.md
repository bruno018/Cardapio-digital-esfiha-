# PRD - Cardápio Digital Esfiharia

## Problem Statement
Criar um app usando react e node js, um cardapio digital para uma esfiharia, onde o usuario tem funções de carrinho onde todos os produtos selecionados vão, depois que o cliente fizer o pedido vai para parte da cozinha e quando finalizar para o caixa.

## User Choices
- Sem autenticação
- Tema escuro moderno
- Cardápio padrão com esfihas, bebidas, sobremesas

## User Personas
1. **Cliente**: Visualiza cardápio, adiciona itens ao carrinho, faz pedido (nome + mesa)
2. **Cozinheiro**: Vê pedidos pendentes, marca como "preparando" e "pronto"
3. **Caixa**: Vê pedidos prontos, registra entrega, acompanha faturamento

## Core Requirements
- Cardápio com categorias (Esfihas, Bebidas, Sobremesas)
- Carrinho de compras com quantidade
- Checkout simples (nome + mesa)
- Painel Cozinha com status de pedidos
- Painel Caixa com faturamento

## What's Been Implemented (Jan 2026)
- [x] Backend FastAPI com endpoints CRUD
- [x] MongoDB para persistência
- [x] 18 produtos seed (9 esfihas, 5 bebidas, 4 sobremesas)
- [x] Frontend React com tema escuro
- [x] 4 páginas: Cardápio, Carrinho, Cozinha, Caixa
- [x] Fluxo completo: pending → preparing → ready → delivered
- [x] Auto-refresh nas telas de cozinha/caixa (10s)

## Architecture
- Backend: FastAPI + Motor (MongoDB async)
- Frontend: React + Tailwind + Shadcn UI
- Fonts: Bebas Neue (headings), Manrope (body)

## Backlog
### P0 (Critical)
- N/A - MVP completo

### P1 (High)
- [ ] Notificação sonora para novos pedidos
- [ ] QR Code para mesas
- [ ] Impressão de comanda

### P2 (Medium)
- [ ] Dashboard de relatórios
- [ ] Histórico detalhado de pedidos
- [ ] Modo delivery (endereço)

## Next Tasks
1. Implementar QR Code nas mesas
2. Adicionar som de notificação
3. Dashboard com gráficos de vendas
