Plataforma de consultoria financeira — Alex J. Dantas

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Supabase** (autenticação via Magic Link)

## Estrutura

```
src/
├── app/
│   ├── page.tsx              # Landing page institucional (/)
│   ├── login/page.tsx        # Login com Magic Link
│   ├── auth/callback/route.ts # Callback do Supabase
│   └── app/
│       ├── layout.tsx        # Layout da área logada
│       └── page.tsx          # Dashboard
├── components/
│   ├── landing/              # Componentes da landing page
│   └── app/                  # Componentes da área logada
├── lib/supabase/             # Clientes Supabase (browser, server, middleware)
└── middleware.ts             # Proteção de rotas /app
```

## Configuração

1. Copie `.env.example` para `.env.local` e preencha as credenciais do Supabase.
2. No painel do Supabase, em **Authentication → URL Configuration**, adicione:
   - Site URL: `https://alexjdantas.com.br`
   - Redirect URLs: `http://localhost:3000/auth/callback` e `https://alexjdantas.com.br/auth/callback`
3. Ative **Email** como provider em **Authentication → Providers**.

## Desenvolvimento

```bash
npm run dev
```

- Landing page: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Dashboard: [http://localhost:3000/app](http://localhost:3000/app)
