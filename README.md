# 👗 Brechó Online — Negociação e Troca

Projeto Final da disciplina de Desenvolvimento Web I — IFCE  
Desenvolvimento de um sistema de brechó online com suporte a venda, troca e negociação entre usuários.

---

## 📋 Descrição do Sistema

Plataforma front-end de brechó online que permite anunciar, comprar e trocar roupas usadas.  
O sistema conta com moeda virtual (VATs), sistema de propostas e contrapropostas, chat temporário,  
garagem virtual e avaliação entre usuários. Todos os dados são persistidos via **localStorage**.

---

## 🚀 Tecnologias Utilizadas

- React
- localStorage / JSON Server (simulação de API)
- Git + GitHub

---

## ⚙️ Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/DavidEricson00/Brecho-Oline.git

# Acesse a pasta
cd Brecho-Oline

# Instale as dependências
npm install

# Inicie o projeto
npm start
```

---

## ✅ Funcionalidades Obrigatórias

- [ ] **Autenticação simulada** — Cadastro e login com persistência no localStorage; perfil com nome, e-mail, telefone, endereço e avatar
- [ ] **Cadastro e listagem de anúncios** — Formulário completo com título, descrição, categoria, tamanho, estado de conservação, foto, modalidade (Venda / Troca / Ambos) e valor em VATs
- [ ] **Filtros e busca** — Filtragem por categoria, tamanho, modalidade e faixa de preço; busca por texto
- [ ] **Moeda virtual VAT** — Saldo por usuário, compra de VATs, validação de equivalência em trocas (tolerância de 20%), conversão de VATs em dinheiro
- [ ] **Sistema de propostas e negociação** — Envio de proposta, aceite, recusa e contraproposta; histórico em linha do tempo
- [ ] **Chat temporário** — Criado após proposta aceita; disponível por 7 dias; botão para encerrar negociação
- [ ] **Garagem Virtual** — Três listas por usuário: Disponível, Em Negociação e Trocado/Vendido; movimentação manual entre listas
- [ ] **Avaliação pós-negociação** — Nota de 1 a 10 estrelas + comentário opcional; exibição de média e total de negociações no perfil
- [ ] **Layout responsivo** — Compatível com desktop (1024px+) e mobile (375px+); menu de navegação completo

---

## ⭐ Funcionalidades Opcionais (Diferenciais)

- [ ] Selos de confiabilidade baseados em avaliações e tempo de cadastro
- [ ] Carrinho de troca múltipla (2+ peças por 2+ peças)
- [ ] Modo escuro persistente no localStorage
- [ ] Animações e transições suaves
- [ ] Gráfico de evolução do saldo de VATs ou número de negociações

---

## 🗂️ Estrutura de Dados (localStorage)

| Chave           | Conteúdo                              |
|-----------------|---------------------------------------|
| `usuarios`      | Lista de usuários cadastrados         |
| `usuarioLogado` | Usuário da sessão atual               |
| `anuncios`      | Todos os anúncios criados             |
| `propostas`     | Histórico de propostas e negociações  |
| `chats`         | Mensagens dos chats temporários       |
| `avaliacoes`    | Avaliações pós-negociação             |

---

## 💱 Como Funciona a Moeda VAT

- Todo usuário começa com **0 VATs**
- VATs podem ser comprados com dinheiro real (simulado)
- Cada anúncio tem um valor em VATs definido pelo dono
- Em trocas, o sistema verifica se os valores são equivalentes (diferença máxima de 20%)
- Se houver diferença, o sistema sugere complementar com outras peças ou VATs
- VATs podem ser convertidos de volta em dinheiro

---

## 🔄 Fluxo de Uso

1. Usuário se cadastra e cria anúncio com valor em VATs
2. Outro usuário encontra o anúncio e envia uma proposta (valor ou peças para troca)
3. O anunciante aceita, recusa ou faz uma contraproposta
4. Após aceite, um chat temporário é criado para combinar a entrega
5. Ao concluir, ambos avaliam um ao outro e os VATs são transferidos

---

## 📱 Telas Principais

- Tela de Login / Cadastro
- Home / Explorar Anúncios
- Detalhe do Anúncio
- Criar / Editar Anúncio
- Minhas Negociações
- Chat da Negociação
- Garagem Virtual
- Perfil do Usuário

## 📬 Entrega

Enviar para: **samuel.araujo@ifce.edu.br**  
Incluir: link do repositório + vídeo de apresentação (3 a 5 minutos)
