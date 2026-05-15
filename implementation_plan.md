# Plano de Implementacao: IEVC Historico

Atualizado em: 2026-05-15

Este documento e a fonte de verdade operacional do projeto. Deve ser lido e atualizado antes e depois de alteracoes estruturais, integracoes externas, mudancas de schema ou novas funcionalidades relevantes.

## 1. Estado Atual do Projeto

- Aplicacao: sistema de levantamento historico da IEVC para recolha de memorias, testemunhos, fotos e documentos dos 30 anos.
- Stack: Next.js 14, TypeScript, Tailwind CSS, Prisma, Supabase, next-i18next, Zustand, PWA, Vercel.
- Repositorio Git remoto local: `https://github.com/MessP13/ievc-historico.git`.
- Deploy publico verificado em 2026-05-15: `https://ievc-historico.vercel.app` respondeu `200 OK` e carregou a home `IEVC - Memoria Historica`.
- Vercel local: `.vercel/repo.json` aponta para o projeto `ievc-historico`, id `prj_nUGSSqiQjhTBV8z0T1Tnd3eNbD35`, org/team `team_ktUSD6nGv1seMXKTwVGLXwOV`.
- Supabase local: o projeto usa variaveis `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. Nao expor valores secretos no repositorio ou em logs.
- Storage: upload usa bucket Supabase `ievc-historico`.
- Banco: schema Prisma define `Province`, `District`, `User`, `Form`, `Answer`, `PastorEntry` e `Attachment`, com cascata em respostas, pastores e anexos quando o formulario e removido.
- Idiomas configurados: `pt`, `en`, `sn`, `ts`, `nd`.
- PWA: configurado via `@ducanh2912/next-pwa`, com service worker gerado em build.

## 2. Funcionalidades Implementadas

- Home publica com chamada para preenchimento do formulario.
- Formulario em 10 secoes com progresso, autosave local e campos especializados.
- Seletor de localizacao por provincia, distrito e igreja.
- Autenticacao por telefone/SMS via Supabase Auth em `/entrar`.
- APIs de formularios, respostas, submissao, status e exportacao.
- Painel admin com lista de formularios, estatisticas e links de exportacao.
- Exportacao individual em PDF, DOCX e XLSX.
- Exportacao geral via `/api/admin/export-all`.
- Upload de ficheiros para Supabase Storage.
- Seed Prisma com provincias e distritos de Mocambique.

## 3. Validacao de 2026-05-15

- `npx tsc --noEmit`: passou sem erros.
- `npm run build`: Prisma Client foi gerado, Next compilou com sucesso, PWA foi gerado e as 12 paginas estaticas foram geradas. A execucao excedeu 300s durante `Finalizing page optimization / Collecting build traces`, portanto o comando nao fechou com codigo de sucesso dentro do limite.
- `npm run lint`: nao executou lint real porque `next lint` abriu o assistente interativo de configuracao ESLint. Ainda falta adicionar uma configuracao ESLint para CI/local.
- Site publico: verificado via requisicao HTTP com `200 OK`.

## 4. Riscos e Problemas Encontrados

- Fluxo de cadastro: `pages/entrar.tsx` chama `PUT /api/users/me` enviando `fullName` e `phone`, mas `pages/api/users/me.ts` exige `userId`. Resultado provavel: novo utilizador nao consegue concluir o passo de nome.
- Criacao/submissao de formulario: a pagina `/formulario` permite concluir localmente se `formId` estiver ausente; isso preserva UX offline, mas pode gerar falsa sensacao de submissao ao banco.
- API `/api/forms/[id]/submit`: salva `section` como `questionKey`, enquanto `/api/forms/[id]/answers` usa mapeamento correto por secao. Isso pode prejudicar exportacao/organizacao dos dados.
- Admin e APIs sensiveis: painel `/admin` e exportacoes dependem de dados Prisma, mas precisam de protecao clara por sessao, role ou `ADMIN_API_KEY`.
- Supabase RLS: ainda precisa ser confirmado/aplicado para as tabelas do projeto sem alterar tabelas legadas de outros subprojetos.
- Build em Windows: a etapa final de traces pode ser lenta demais ou ficar presa; investigar se ha impacto de `.next`, PWA, antivirus/indexacao ou dependencias.
- Encoding: algumas saidas do PowerShell exibiram acentos quebrados, embora o HTML publico esteja correto em UTF-8. Evitar regravar ficheiros de conteudo sem garantir encoding.

## 5. Cuidados Operacionais

- Nao fazer commit, push, upload ou deploy sem ordem explicita.
- Nao editar `next-env.d.ts`; ele e gerado pelo Next.js.
- Nao rodar comandos destrutivos de Prisma contra Supabase.
- Antes de qualquer migracao, gerar SQL em modo revisavel e confirmar que tabelas legadas, como `inscricoes_30_anos`, nao serao alteradas ou removidas.
- Nunca registrar valores de `.env`, tokens Vercel, service role key ou credenciais de banco em documentos versionados.

## 6. Proximos Passos Recomendados

- [ ] Corrigir o envio de `userId` em `/entrar` ou flexibilizar `/api/users/me` para obter o utilizador autenticado de forma segura.
- [ ] Normalizar a secao salva por `/api/forms/[id]/submit` usando o mesmo mapeamento de `/api/forms/[id]/answers`.
- [ ] Proteger `/admin` e rotas de exportacao com autenticacao/autorizacao.
- [ ] Criar configuracao ESLint nao interativa e rodar `npm run lint` de verdade.
- [ ] Investigar timeout do `npm run build` na etapa de traces e confirmar build completo em ambiente limpo.
- [ ] Auditar RLS e policies Supabase para as tabelas Prisma deste projeto.
- [ ] Validar fluxo completo: entrar por telefone, criar formulario, autosave, upload, submissao, revisao admin e exportacao.
- [ ] Confirmar variaveis no painel Vercel sem expor valores no repositorio.

## 7. Historico Recente

- 2026-05-15: executada contextualizacao do ToDo `.todo4vcode/shared-tasks.json`; analisados arquivos principais, schema Prisma, integracao Supabase, configuracao Vercel local, Git remoto e site publico; plano atualizado com estado atual, riscos e proximos passos.
