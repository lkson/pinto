# Instruções para fazer Push para o GitHub

## Opção 1: Usar o Script Automático (Recomendado)

1. **Instale o Git** (se ainda não tiver):
   - Baixe em: https://git-scm.com/download/win
   - Instale com as opções padrão

2. **Execute o script**:
   ```powershell
   cd e:\cacaushow\pascoa
   .\git-push.ps1
   ```

## Opção 2: Comandos Manuais

Se preferir fazer manualmente, execute os seguintes comandos no PowerShell:

```powershell
cd e:\cacaushow\pascoa

# Inicializar repositório (se ainda não foi feito)
git init

# Configurar remote com token (substitua SEU_TOKEN pelo seu token)
git remote add origin https://SEU_TOKEN@github.com/lkson/pinto.git

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Cacau Show Páscoa project"

# Fazer push
git branch -M main
git push -u origin main
```

## Opção 3: Usar GitHub Desktop

1. Instale o GitHub Desktop: https://desktop.github.com/
2. Abra o GitHub Desktop
3. File > Add Local Repository
4. Selecione a pasta `e:\cacaushow\pascoa`
5. Publish repository
6. URL: `https://github.com/lkson/pinto`
7. Use o token como senha quando solicitado

## Token de Acesso

**IMPORTANTE**: O token deve ser mantido em segredo. Não compartilhe publicamente.
Use variáveis de ambiente ou configuração local para armazenar o token.
