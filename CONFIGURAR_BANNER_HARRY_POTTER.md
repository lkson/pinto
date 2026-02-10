# Configurar Banner Pop-up Harry Potter

## Status
✅ Banner pop-up implementado e funcional

## Funcionalidades Implementadas

1. **Aparece automaticamente** ao carregar a página principal (`index.html`)
2. **Botão de fechar** no canto superior direito
3. **Overlay escuro** ao fundo
4. **Clique na imagem** redireciona para o produto Harry Potter
5. **Responsivo** para mobile e desktop
6. **Animação suave** ao aparecer
7. **Fechar com ESC** ou clicando fora da imagem
8. **Não reaparece** na mesma sessão após fechar (usando sessionStorage)

## Localização da Imagem

A imagem do banner deve estar em:
```
assets/c__Users_Lucas_Xavier_AppData_Roaming_Cursor_User_workspaceStorage_30ba6792028eed11b86af289002a7a23_images_ChatGPT_Image_10_de_fev._de_2026__09_23_25-4dad1180-2a6c-4d29-846b-69af6fdd6429.png
```

## Se a Imagem Não Estiver no Projeto

1. Copie a imagem para a pasta `assets/`
2. Ou atualize o caminho no código em `index.html` (linha ~1972)

## Personalização

### Alterar Link do Produto
No arquivo `index.html`, linha ~1971, altere:
```html
<a href="produto 4/index.html" class="harry-potter-banner-link">
```

### Alterar Tempo de Aparição
No arquivo `index.html`, linha ~2025, altere:
```javascript
setTimeout(function() {
    // ...
}, 500); // Altere 500 para o tempo desejado em milissegundos
```

### Desabilitar Não Reaparecer na Sessão
Remova ou comente a linha ~2020:
```javascript
// var bannerClosed = sessionStorage.getItem('harryPotterBannerClosed');
```

## Teste

1. Abra `index.html` no navegador
2. O banner deve aparecer após 500ms
3. Clique no X para fechar
4. Recarregue a página - o banner não deve aparecer novamente (na mesma sessão)
5. Abra em uma nova aba/janela - o banner deve aparecer novamente

## Estrutura do Código

- **HTML**: Modal com overlay e imagem
- **CSS**: Estilos responsivos e animações
- **JavaScript**: Lógica de exibição e fechamento

O código está localizado no final do arquivo `index.html`, antes do fechamento do body.
