# Brechó Online - Negociação e Troca

## Integrantes

* **David Ericson de Oliveira Biserra**
* **Roberto Carlos dos Santos de Melo Junior**
* **Suyane Oliveira da Silva**
* **Pedro Ygor Beserra Pereira**
* **João Marcos Francelino Macedo**

* **Curso:** Bacharelado em Sistemas de Informação
* **Instituição:** Instituto Federal de Educação, Ciência e Tecnologia do Ceará (IFCE)
* **Disciplina:** Desenvolvimento Web I

## Descrição do Sistema

O **Brechó Online** é uma aplicação web *Single Page Application* (SPA) desenvolvida com a biblioteca **React**. O sistema simula de forma integral uma plataforma de economia circular focada na compra, venda e troca de roupas e acessórios seminovos ou usados. 

Com o intuito de incentivar o consumo sustentável e a reutilização de peças de vestuário, o sistema introduz um conceito de moeda virtual chamada **VAT**. Essa moeda virtual atua como o facilitador financeiro dentro da plataforma, permitindo transações de compra direta ou servindo como complemento financeiro nas trocas de itens.

O projeto foi concebido inteiramente no modelo *client-side* (front-end), dispensando uma infraestrutura de back-end ativa. Toda a lógica de negócios, gerenciamento de estado das sessões, fluxo de mensagens, controle das negociações bilaterais e regras de transação financeira são processados no navegador do usuário, com a persistência contínua dos dados sendo mantida por meio do mecanismo de armazenamento local (**localStorage**).

## Funcionalidades Implementadas

### Funcionalidades Obrigatórias

- [x] Cadastro de usuários
- [x] Login e autenticação simulada
- [x] Persistência do usuário logado
- [x] Perfil com nome, e-mail, telefone, endereço e avatar
- [x] Proteção de rotas para usuários autenticados

- [x] Cadastro de anúncios
- [x] Edição de anúncios
- [x] Exclusão de anúncios
- [x] Listagem pública de anúncios
- [x] Busca por título e descrição
- [x] Filtros por categoria
- [x] Filtros por tamanho
- [x] Filtros por modalidade de negociação
- [x] Filtros por faixa de VATs
- [x] Ordenação por valor e data

- [x] Sistema de moeda virtual VAT
- [x] Visualização de saldo de VATs
- [x] Compra simulada de VATs
- [x] Saque simulado de VATs

- [x] Envio de propostas para compra
- [x] Envio de propostas para troca
- [x] Envio de contrapropostas
- [x] Aceitação de propostas
- [x] Recusa de propostas
- [x] Histórico de negociações em linha do tempo

- [x] Central de negociações
- [x] Controle de status das negociações

- [x] Chat temporário após aceitação da proposta
- [x] Envio de mensagens entre usuários
- [x] Encerramento da negociação
- [x] Expiração do chat após 7 dias

- [x] Garagem virtual
- [x] Lista de itens disponíveis
- [x] Lista de itens em negociação
- [x] Histórico de itens vendidos ou trocados
- [x] Alteração manual de status dos anúncios

- [x] Avaliação pós-negociação
- [x] Nota de 1 a 10 estrelas
- [x] Comentário opcional
- [x] Exibição da média de avaliações
- [x] Exibição do total de negociações concluídas

- [x] Interface responsiva para desktop e dispositivos móveis

### Funcionalidades Opcionais

- [ ] Selos de confiabilidade
- [ ] Carrinho de troca múltipla
- [ ] Modo escuro persistente
- [ ] Animações suaves
- [ ] Gráfico de evolução de VATs ou negociações

## Instalação

Siga as etapas abaixo para preparar o ambiente de desenvolvimento local:

1. Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina.
2. Extraia os arquivos do projeto ou clone o repositório.
3. Abra o terminal na pasta raiz do projeto.
4. Execute o comando a seguir para instalar todas as dependências mapeadas no arquivo `package.json`:

```bash
npm install
```


## Execução

Após a conclusão da instalação das dependências, inicie o servidor de desenvolvimento local utilizando o script configurado para o **Vite**:

```bash
npm run dev
```

O terminal exibirá a URL local gerada (geralmente `http://localhost:5173`). Abra o endereço no navegador de sua preferência para interagir com o sistema.


## Screenshots

![imagem](https://i.imgur.com/95TzEgs.jpeg)

![imagem](https://i.imgur.com/Llj47Ly.jpeg)

![imagem](https://i.imgur.com/58ebAS3.jpeg)

![imagem](https://i.imgur.com/nndTtQw.jpeg)

## Dificuldades Encontradas

O desenvolvimento desta plataforma impôs diversos desafios técnicos devido à complexidade das regras de negócio aliada à ausência de uma camada de back-end real:

* **Emulação da Arquitetura sem Back-End:** Projetar e organizar uma lógica fluida de sistema web complexo simulando respostas de API, atualizações em tempo real e conexões assíncronas apenas manipulando estados locais no navegador.
* **Modelagem Relacional de Dados Não Estruturados:** Estabelecer a consistência referencial (ex: vincular mensagens do chat, propostas de peças, avaliações e transações financeiras aos respectivos IDs de usuários e anúncios) operando exclusivamente com matrizes JSON simples no `localStorage`.
* **Sincronização de Estados das Propostas e Contrapropostas:** Desenvolver um fluxo alternado de interações (comprador envia oferta, vendedor contrapropõe, comprador aceita) controlando permissões de edição e garantindo que o status de ambas as partes permaneça idêntico e consistente.
* **Integridade das Transações com Concorrência Simulada:** Evitar problemas lógicos de integridade de dados (como garantir que uma peça usada como moeda de troca em uma proposta aceita mude seu status global para `trocado` e desapareça de outras buscas, e validar o saldo de VATs do comprador no exato momento da conclusão da transação).
* **Ciclo de Vida e Controle de Estados de Anúncios:** Coordenar a transição segura dos status dos anúncios (`disponivel`, `em_negociacao`, `vendido`, `trocado`) a partir de eventos gerados em diferentes pontos do aplicativo (Garagem, Detalhes, Negociações ou Chat).
* **Processamento e Otimização de Consultas Client-side:** Criar algoritmos eficientes em JavaScript para realizar filtragens combinadas multicritério, buscas textuais tolerantes com remoção de diacríticos e ordenação sob demanda sem recorrer a consultas de banco de dados estruturado (SQL/NoSQL).
* **Escalabilidade de Componentes React:** Organizar componentes de forma reutilizável e desacoplada (como o `AnuncioCard` e modais reutilizáveis), otimizando a propagação de estados a fim de evitar re-renderizações desnecessárias e manter a performance da interface reativa.
* **Garantia de Responsividade:** Ajustar o design visual desenvolvido em Vanilla CSS para comportar de maneira polida e limpa layouts ricos e cheios de detalhes (como a interface dividida de Chat e Negociações) tanto em telas de dispositivos móveis quanto em computadores desktop.


## Soluções Adotadas

A equipe superou os desafios descritos implementando as seguintes soluções de engenharia de software:

* **Gerenciador de Sessão com Context API:** A criação do `AuthContext` permitiu unificar e prover informações do usuário logado de forma limpa por toda a árvore de componentes da aplicação, agilizando consultas de permissões e sincronização do saldo de VATs.
* **Sanitização de Consultas e Normalização Textual:** Implementação do método `normalize('NFD').replace(/\p{Diacritic}/gu, '')` e conversão para caixa baixa nas chaves de busca da página principal. Isso garante que buscas por termos com acentos ou variações de maiúsculas encontrem os anúncios corretamente na memória do navegador.
* **Manipulação Atomizada do LocalStorage:** Centralização de escritas e leituras do armazenamento local através de funções de apoio, garantindo conversão JSON segura, limpeza de estados obsoletos e recarregamento coordenado para atualizar os estados visuais dos componentes React.
* **Cálculo de Estatísticas Dinâmicas com Memoization:** Emprego do hook `useMemo` nas páginas de Perfil e Negociações para processar agregações em tempo real (como a média das avaliações e negociações finalizadas) apenas quando os dados de origem sofrerem alterações, preservando a performance da renderização.
* **Validação de Transações de Moeda Virtual (VAT) na Conclusão:** Lógica de processamento de transações que realiza uma dupla checagem na finalização do negócio. O sistema debita o valor apenas após verificar que o comprador possui saldo disponível e altera as peças ofertadas em troca simultaneamente no array de anúncios no `localStorage`.
* **Expirabilidade de Negociações no Chat:** Implementação de controle temporal de ciclos de vida no chat. Ao concluir ou cancelar um negócio, o sistema adiciona uma data limite (`expiradoEm`) somando sete dias ao horário atual. Os componentes de rota e renderização de chat validam essa propriedade contra o timestamp atual do sistema para bloquear o acesso de forma segura e transparente.


## Considerações Finais

A idealização e o desenvolvimento do **Brechó Online com Negociação e Troca** consolidou conhecimentos valiosos a respeito do desenvolvimento de aplicações *Single Page* dinâmicas utilizando **React**. 

A necessidade de projetar todas as regras de negócio e a persistência no lado do cliente forçou a equipe a aprofundar-se em tópicos cruciais da computação web, tais como gerenciamento de estados reativos, manipulação avançada de arrays de dados, otimização de renderização e integridade transacional simulada. 

Além do aspecto puramente técnico, a concepção do produto forneceu uma perspectiva realista sobre os desafios de experiência de usuário (UX) em ecossistemas colaborativos e de trocas diretas. O projeto demonstra a viabilidade de desenvolver protótipos de alta fidelidade e interfaces funcionais ricas que validam conceitos complexos de forma independente de serviços de servidor.
