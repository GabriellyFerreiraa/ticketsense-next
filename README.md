> **Note:** This is the Next.js port of [TicketSense](https://github.com/GabriellyFerreiraa/ticketsense). Same product, different architecture — built to compare the two approaches side by side. See [Why two versions?](#-why-two-versions) below.

# ⚡ TicketSense (Next.js)

An AI-powered support ticket triage system, rebuilt on **Next.js 16 App Router**. Requesters describe their issue in plain language; Google Gemini suggests a category, urgency level, and first diagnostic steps — the same first-response thinking a helpdesk analyst does manually, now assisted by AI.

🔗 **Live demo:** [ticketsense-next.vercel.app](https://ticketsense-next.vercel.app)

---

## 🔀 Why two versions?

The original TicketSense runs on **React + Vite** with a **Supabase Edge Function** protecting the Gemini API key. This version runs the same product on **Next.js App Router** with a **Route Handler** doing that job.

Both keep the API key server-side. The difference is where the server boundary lives:

| | React + Vite | Next.js App Router |
|---|---|---|
| API key protection | Supabase Edge Function (Deno) | Route Handler (`app/api/triage/route.ts`) |
| Route protection | Client-side guard | `proxy.ts` — HTML for a protected route is never generated |
| Data fetching | `useEffect` + loading state | `async` Server Component, queried on the server |
| Deploy targets | Netlify + Supabase Functions | Vercel (single deploy) |

**When I'd pick each:** the Edge Function makes sense when the frontend is a static SPA and the backend has to live somewhere else anyway. The Route Handler makes sense when Next.js is already in the stack — it removes a separate deploy, separate infrastructure and CORS configuration.

The security principle is identical in both. Only the plumbing changes.

---

## 🇬🇧 English

### About the project

Built to reflect real IT support/helpdesk experience: when a ticket comes in, an AI classification step reads the title and description and returns a category (hardware, software, network, access, other), an urgency level (low to critical), and 2–4 concrete first diagnostic steps — before any human even opens the ticket. Agents can always override the AI's read; the AI assists triage, it doesn't replace judgment.

### Features

- **Server-side auth guard** — `proxy.ts` intercepts requests before rendering. An unauthenticated user never receives the HTML of a protected route, so the guard can't be bypassed from DevTools.
- **AI-assisted triage** via a Next.js Route Handler calling the Gemini API — `GEMINI_API_KEY` has no `NEXT_PUBLIC_` prefix, so it never enters the client bundle.
- **Server Components** query Supabase directly on the server — no `useEffect`, no loading state, no data-fetching round trip from the browser.
- **Row Level Security** enforcing that requesters only ever see their own tickets, at the database level.
- **Structured AI output** — Gemini is called with `responseMimeType: "application/json"`, so the response is parsed directly instead of stripping markdown fences.

### Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Row Level Security) via `@supabase/ssr`
- Google Gemini API for ticket classification

### Running locally

```bash
git clone https://github.com/GabriellyFerreiraa/ticketsense-next.git
cd ticketsense-next
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Create a `.env.local` file first:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

Note the naming: the Supabase URL and anon key carry `NEXT_PUBLIC_` because the browser client needs them and they're public by design (protected by RLS). `GEMINI_API_KEY` deliberately does not — that prefix is the entire mechanism keeping it off the client.

---

## 🇪🇸 Español

### Sobre el proyecto

Creado para reflejar experiencia real en soporte técnico/helpdesk: cuando llega un ticket, un paso de clasificación con IA lee el título y la descripción y devuelve una categoría (hardware, software, red, acceso, otro), un nivel de urgencia (bajo a crítico) y de 2 a 4 pasos concretos de diagnóstico inicial — antes de que un humano siquiera abra el ticket. Los agentes siempre pueden corregir la lectura de la IA; la IA asiste en la clasificación, no reemplaza el criterio.

### Funcionalidades

- **Protección de rutas en el servidor** — `proxy.ts` intercepta la petición antes del renderizado. Un usuario sin sesión nunca recibe el HTML de una ruta protegida, así que la protección no se puede eludir desde DevTools.
- **Triage asistido por IA** mediante un Route Handler de Next.js que llama a la API de Gemini — `GEMINI_API_KEY` no lleva el prefijo `NEXT_PUBLIC_`, por lo que nunca entra al bundle del cliente.
- **Server Components** que consultan Supabase directamente en el servidor — sin `useEffect`, sin estado de carga, sin ida y vuelta desde el navegador.
- **Row Level Security** asegurando que cada requester solo vea sus propios tickets, a nivel de base de datos.
- **Salida estructurada de la IA** — se llama a Gemini con `responseMimeType: "application/json"`, así la respuesta se parsea directamente en vez de limpiar bloques de markdown.

### Tecnologías utilizadas

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Row Level Security) vía `@supabase/ssr`
- Google Gemini API para clasificación de tickets

### Cómo ejecutar localmente

```bash
git clone https://github.com/GabriellyFerreiraa/ticketsense-next.git
cd ticketsense-next
npm install
npm run dev
```

La app corre en `http://localhost:3000`. Primero creá un archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
GEMINI_API_KEY=tu_clave_de_gemini
```

Notá los nombres: la URL y la anon key de Supabase llevan `NEXT_PUBLIC_` porque el cliente del navegador las necesita y son públicas por diseño (están protegidas por RLS). `GEMINI_API_KEY` deliberadamente no lo lleva — ese prefijo es todo el mecanismo que la mantiene fuera del cliente.

---

## 🇧🇷 Português

### Sobre o projeto

Criado pra refletir experiência real em suporte técnico/helpdesk: quando um chamado chega, uma etapa de classificação com IA lê o título e a descrição e retorna uma categoria (hardware, software, rede, acesso, outro), um nível de urgência (baixa a crítica) e de 2 a 4 passos concretos de diagnóstico inicial — antes mesmo de um humano abrir o chamado. O agente sempre pode corrigir a leitura da IA; a IA ajuda na triagem, não substitui o julgamento.

### Funcionalidades

- **Proteção de rotas no servidor** — `proxy.ts` intercepta a requisição antes da renderização. Um usuário sem sessão nunca recebe o HTML de uma rota protegida, então a proteção não pode ser burlada pelo DevTools.
- **Triagem assistida por IA** via um Route Handler do Next.js chamando a API do Gemini — `GEMINI_API_KEY` não tem o prefixo `NEXT_PUBLIC_`, então nunca entra no bundle do cliente.
- **Server Components** consultando o Supabase direto no servidor — sem `useEffect`, sem estado de loading, sem ida e volta a partir do navegador.
- **Row Level Security** garantindo que cada requester só vê os próprios chamados, direto no banco de dados.
- **Saída estruturada da IA** — o Gemini é chamado com `responseMimeType: "application/json"`, então a resposta é parseada direto em vez de limpar blocos de markdown.

### Tecnologias utilizadas

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Row Level Security) via `@supabase/ssr`
- Google Gemini API pra classificação de chamados

### Como rodar localmente

```bash
git clone https://github.com/GabriellyFerreiraa/ticketsense-next.git
cd ticketsense-next
npm install
npm run dev
```

O app roda em `http://localhost:3000`. Primeiro crie um arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
GEMINI_API_KEY=sua_chave_do_gemini
```

Repare nos nomes: a URL e a anon key do Supabase levam `NEXT_PUBLIC_` porque o cliente do navegador precisa delas e são públicas por design (protegidas por RLS). `GEMINI_API_KEY` deliberadamente não leva — esse prefixo é todo o mecanismo que a mantém fora do cliente.

---

## 📂 Project Structure

```
src/
 ├─ app/
 │   ├─ api/
 │   │   └─ triage/
 │   │       └─ route.ts     # Gemini call — server only, key never leaves here
 │   ├─ login/
 │   │   └─ page.tsx         # Client Component — browser Supabase client
 │   ├─ tickets/
 │   │   └─ page.tsx         # Server Component — queries Supabase directly
 │   ├─ triage/
 │   │   └─ page.tsx         # Client Component — calls /api/triage
 │   ├─ layout.tsx
 │   └─ globals.css
 ├─ lib/
 │   └─ supabase/
 │       ├─ client.ts        # createBrowserClient — session in browser storage
 │       └─ server.ts        # createServerClient — session read from cookies
 └─ proxy.ts                 # Session refresh + route protection
next.config.ts               # proxyDir: './src'
```

**On the two Supabase clients:** the browser client stores the session in browser storage; the server client reads it from request cookies, because `localStorage` doesn't exist on the server. Same library, two environments. `proxy.ts` is what keeps the session token fresh between them.

---

## 👩‍💻 Author / Autora

**Gabrielly Ferreira**
📫 gabiferreira101@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/gabrielly-ferreira-619609113/) · [GitHub](https://github.com/GabriellyFerreiraa)
