# Ocena kandydatów — Handlowiec Go2Ops

Aplikacja Next.js z backendem opartym o Vercel KV (Redis). Dane kandydatów
zapisywane są w bazie, więc są dostępne z każdego urządzenia/przeglądarki,
nie tylko lokalnie.

## Struktura

- `app/page.tsx` — interfejs (lista kandydatów, pytania, arkusz oceny)
- `app/api/candidates/route.ts` — API: `GET` zwraca kandydatów, `POST` zapisuje całość
- `app/globals.css` — style

## Jak opublikować na Vercelu

### 1. Konto i CLI

Jeśli nie masz konta: [vercel.com/signup](https://vercel.com/signup) (może być przez GitHub).

Zainstaluj CLI lokalnie (opcjonalnie, można też wdrożyć przez dashboard + GitHub):

```
npm install -g vercel
```

### 2. Wypchnij projekt do repozytorium GitHub (zalecane)

```
cd ocena-kandydatow
git init
git add .
git commit -m "Initial commit"
```

Utwórz repo na GitHubie i wypchnij (`git remote add origin ...`, `git push`).

### 3. Importuj projekt w Vercelu

- Wejdź na [vercel.com/new](https://vercel.com/new)
- Wybierz repozytorium z GitHuba
- Framework zostanie wykryty automatycznie jako Next.js — nie trzeba nic zmieniać
- Kliknij **Deploy**

(Alternatywnie, bez GitHuba: z poziomu folderu projektu uruchom `vercel`, zaloguj się, potwierdź ustawienia — CLI samo utworzy projekt i wdroży.)

### 4. Dodaj bazę Vercel KV

To jest krok, bez którego zapis danych nie zadziała:

1. W panelu projektu w Vercelu wejdź w zakładkę **Storage**
2. Kliknij **Create Database** → wybierz **KV** (Redis)
3. Nadaj nazwę (np. `ocena-kandydatow-kv`) i utwórz
4. Po utworzeniu połącz bazę z projektem (**Connect to Project** — jeśli nie zrobi się automatycznie)
5. Vercel sam doda potrzebne zmienne środowiskowe (`KV_REST_API_URL`, `KV_REST_API_TOKEN` itd.) — nie trzeba nic wpisywać ręcznie

### 5. Redeploy

Po podłączeniu bazy zrób ponowny deployment, żeby zmienne środowiskowe się załadowały:

- W panelu: **Deployments** → **...** przy najnowszym deployu → **Redeploy**
- Albo z CLI: `vercel --prod`

### 6. Gotowe

Aplikacja będzie dostępna pod adresem `https://twoj-projekt.vercel.app`. Możesz go otworzyć na telefonie w trakcie rozmów rekrutacyjnych — dane są wspólne między urządzeniami.

## Praca lokalna (opcjonalnie)

Żeby uruchomić lokalnie z połączeniem do tej samej bazy:

```
vercel link          # połącz folder z projektem w Vercelu
vercel env pull .env.local   # pobierz zmienne środowiskowe (w tym dane KV)
npm install
npm run dev
```

Aplikacja wystartuje na `http://localhost:3000`.
