# Cacau Show - Páscoa

Projeto estático HTML/CSS/JavaScript para a página de Páscoa da Cacau Show.

## Como rodar localmente

Este é um projeto estático que não requer compilação. Escolha uma das opções abaixo:

### Opção 1: Usando Node.js (Recomendado)

Se você tem Node.js instalado:

```bash
npm install
npm start
```

O projeto estará disponível em `http://localhost:8080`

### Opção 2: Usando Python

Se você tem Python instalado:

**Python 3:**
```bash
python -m http.server 8080
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

Depois acesse `http://localhost:8080` no navegador.

### Opção 3: Usando PHP

Se você tem PHP instalado:

```bash
php -S localhost:8080
```

Depois acesse `http://localhost:8080` no navegador.

### Opção 4: Usando extensão do VS Code

1. Instale a extensão "Live Server" no VS Code
2. Clique com o botão direito no arquivo `index.html`
3. Selecione "Open with Live Server"

### Opção 5: Abrir diretamente no navegador

Você pode abrir o arquivo `index.html` diretamente no navegador, mas algumas funcionalidades podem não funcionar devido a restrições de CORS (Cross-Origin Resource Sharing).

## Estrutura do Projeto

```
.
├── css/          # Arquivos de estilos
├── fonts/        # Fontes do projeto
├── images/       # Imagens e assets
├── js/           # Arquivos JavaScript
└── index.html    # Página principal
```

## Notas

- Este projeto faz requisições para APIs externas (Google Tag Manager, Analytics, etc.)
- Algumas funcionalidades podem requerer conexão com o backend da Cacau Show
- Para desenvolvimento local completo, pode ser necessário configurar um proxy ou mock das APIs
