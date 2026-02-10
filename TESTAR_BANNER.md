# Testar Banner Harry Potter

## Problema
A imagem do banner não está carregando.

## Soluções Implementadas

1. ✅ Caminho codificado com espaços (%20)
2. ✅ Tratamento de erro na imagem
3. ✅ Logs de debug no console
4. ✅ Fallback para caminho sem codificação

## Teste Rápido

1. Abra o console do navegador (F12)
2. Recarregue a página
3. Verifique os logs:
   - "Exibindo banner Harry Potter" - modal está aparecendo
   - "Imagem do banner carregada com sucesso" - imagem carregou
   - Ou mensagens de erro - indica problema no caminho

## Solução Alternativa: Renomear Arquivo

Se ainda não funcionar, renomeie o arquivo para remover espaços:

**Nome atual:**
```
ChatGPT Image 10 de fev. de 2026, 09_23_25.png
```

**Renomear para:**
```
banner-harry-potter.png
```

Depois atualize o código em `index.html` linha ~1974:
```html
<img src="banner/banner-harry-potter.png"
```

## Verificar Caminho Correto

O arquivo deve estar em:
```
E:\cacaushow\pascoa\banner\ChatGPT Image 10 de fev. de 2026, 09_23_25.png
```

## Debug no Console

Abra o console (F12) e execute:
```javascript
// Verificar se o elemento existe
document.getElementById('harry-potter-banner-modal')

// Verificar caminho da imagem
document.querySelector('.harry-potter-banner-image').src

// Forçar exibição do banner
document.getElementById('harry-potter-banner-modal').style.display = 'flex'

// Limpar cache de sessão (para testar novamente)
sessionStorage.removeItem('harryPotterBannerClosed')
```

## Próximos Passos

1. Teste e verifique o console
2. Se houver erro, renomeie o arquivo
3. Ou me informe o erro exato do console
