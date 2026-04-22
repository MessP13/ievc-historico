# IEVC — Sistema de Levantamento Histórico

> Formulário digital para recolha de memórias, testemunhos e documentos históricos da Igreja Evangélica Visão Cristã — celebração de 30 anos.

---

## 🗂️ Estrutura do Projecto

```
ievc-historico/
├── pages/
│   ├── index.tsx              # Página inicial
│   ├── formulario.tsx         # Formulário principal (stepper)
│   ├── obrigado.tsx           # Página de confirmação após envio
│   ├── admin/
│   │   ├── index.tsx          # Painel do pastor (lista de formulários)
│   │   └── formulario/[id].tsx # Revisão detalhada + aprovar/rejeitar
│   └── api/
│       ├── provinces/         # Listar províncias e distritos
│       ├── forms/             # CRUD formulários, respostas, export
│       ├── upload.ts          # Upload de fotos/documentos
│       └── admin/export-all.ts # Export Excel completo
├── components/
│   ├── fields/
│   │   ├── DateFlexField.tsx  # Data incerta (exacta / intervalo / não sabe)
│   │   ├── YesNoField.tsx     # Sim / Não / Não tenho certeza
│   │   ├── MultiSelectField.tsx
│   │   └── UploadField.tsx    # Upload com preview + compressão
│   ├── QuestionField.tsx      # Dispatcher de tipos de pergunta
│   ├── FormProgress.tsx       # Barra de progresso sticky
│   └── LocationSelector.tsx   # Província → Distrito → Igreja
├── lib/
│   ├── questions.ts           # Definição de todas as 32 perguntas
│   ├── store.ts               # Estado global (Zustand + persistência)
│   ├── hooks/useAutoSave.ts   # Auto-save com debounce 2s
│   ├── compress.ts            # Compressão de imagens (browser)
│   ├── prisma.ts              # Cliente Prisma singleton
│   └── supabase.ts            # Clientes Supabase (público + servidor)
├── prisma/
│   ├── schema.prisma          # Schema completo (PostgreSQL)
│   └── seed.ts                # 11 províncias + 154 distritos de Moçambique
├── public/
│   ├── locales/pt/common.json # Traduções Português
│   ├── locales/en/common.json # Traduções Inglês
│   └── manifest.json          # PWA manifest
└── styles/globals.css         # Tailwind + design tokens
```

---

## ⚡ Início Rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU_USUARIO/ievc-historico.git
cd ievc-historico
npm install
```

### 2. Configurar Supabase

1. Criar projecto em [supabase.com](https://supabase.com) (plano gratuito é suficiente)
2. Ir a **Project Settings → Database** e copiar a connection string
3. Ir a **Storage** e criar um bucket chamado `ievc-historico` com acesso público
4. Ir a **Project Settings → API** e copiar URL + anon key + service role key

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Editar .env.local com os valores do Supabase
```

### 4. Inicializar base de dados

```bash
npm run db:push      # Criar tabelas
npm run db:seed      # Inserir províncias e distritos de Moçambique
```

### 5. Executar localmente

```bash
npm run dev
# → http://localhost:3000
```

---

## 🚀 Deploy no Vercel

### Opção A — Via interface Vercel (recomendado)

1. Fazer push do código para GitHub
2. Ir a [vercel.com](https://vercel.com) → **Add New Project**
3. Importar o repositório GitHub
4. Em **Environment Variables**, adicionar todas as variáveis do `.env.example`
5. Clicar **Deploy**

### Opção B — Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Variáveis obrigatórias no Vercel

| Variável | Onde obter |
|----------|-----------|
| `DATABASE_URL` | Supabase → Settings → Database (Transaction pooler) |
| `DIRECT_URL` | Supabase → Settings → Database (Session pooler) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |

---

## 🗄️ Base de Dados

### Diagrama simplificado

```
Province → District → Form → Answer (JSONB)
                         ↓
                      Attachment
```

### Tipos de resposta JSONB

```json
// Data incerta
{ "type": "date_flex", "exact": 1998, "uncertain": false, "notes": "antes da guerra" }

// Escolha múltipla
{ "type": "multi_select", "selected": ["casa", "escola"], "other": "debaixo de uma árvore" }

// Sim/Não
{ "type": "yes_no", "value": true, "notes": "apoio do Brasil em 2003" }
```

---

## 📤 Exportação

Cada formulário pode ser exportado em 3 formatos:

| Formato | URL |
|---------|-----|
| PDF | `/api/forms/[id]/export?format=pdf` |
| Word | `/api/forms/[id]/export?format=docx` |
| Excel | `/api/forms/[id]/export?format=xlsx` |

Export completo de todos os formulários:
```
/api/admin/export-all
```

---

## 🌐 Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial com CTA |
| `/formulario` | Formulário de 10 secções |
| `/obrigado` | Confirmação após envio |
| `/admin` | Painel do pastor |
| `/admin/formulario/[id]` | Revisão individual |

---

## 📱 PWA (Instalável no telemóvel)

O sistema funciona como aplicação instalável no Android e iOS:
- Auto-save no `localStorage` via Zustand
- Funciona com ligação lenta
- Botão "Adicionar ao ecrã inicial" aparece automaticamente

---

## 🌍 Idiomas suportados

| Código | Idioma |
|--------|--------|
| `pt` | Português (padrão) |
| `en` | Inglês |
| `sn` | Sena |
| `ts` | Tsonga / Changana |
| `nd` | Ndau |

Para adicionar traduções: criar `public/locales/[codigo]/common.json` com as mesmas chaves do ficheiro PT.

---

## 🔧 Comandos úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run db:push      # Sincronizar schema com a BD
npm run db:seed      # Popular províncias e distritos
npm run db:studio    # Interface visual da BD (Prisma Studio)
npm run db:generate  # Regenerar cliente Prisma após mudanças no schema
```

---

## 🏗️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Estado | Zustand (persistido no localStorage) |
| Forms | React Hook Form |
| Animações | Framer Motion |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Base de dados | PostgreSQL (via Supabase) |
| Storage | Supabase Storage |
| i18n | next-i18next |
| Export | jsPDF, docx, ExcelJS |
| Deploy | Vercel |

---

## 📞 Suporte

Para questões técnicas, abrir uma issue no GitHub ou contactar o administrador do sistema.
