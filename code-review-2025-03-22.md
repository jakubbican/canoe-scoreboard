# Hodnocení kódu: Scoreboard aplikace

## Principiální připomínky

1. **Organizace CSS**

   - Duplicita kódu mezi komponentami (stejné animace, podobné styly)
   - Chybí jednotný systém pojmenování tříd (střídá se kebab-case a camelCase)
   - Některé CSS soubory jsou příliš dlouhé a nepřehledné (ScheduleDisplay.css, Top10Display.css)

2. **Správa stavu**

   - ScrollManager používá složitý imperativní stavový stroj
   - WebSocketClient používá globální proměnné mimo React lifecycle

3. **Modularita a znovupoužitelnost**

   - Komponenty jako CurrentCompetitor a OnCourseDisplay sdílejí logiku, ale nejsou optimalizovány pro znovupoužití
   - Formátovací funkce jsou duplikovány v různých komponentách

4. **Přístupnost**
   - Chybí explicitní řešení přístupnosti (ARIA role, keyboard navigation)
   - Některé barevné kombinace nemusí splňovat požadavky na kontrastní poměr

## Technické připomínky

1. **Správa assetů**

   - Pouze manuální spouštění build scriptů pro optimalizaci assetů
   - Chybí automatická optimalizace obrázků

2. **Optimalizace výkonu**

   - Některé animace mohou způsobovat layout thrashing
   - Nekonzistentní použití memoizace a useMemo/useCallback

3. **Reaktivita a responsivita**

   - Míchání absolutních (px) a relativních (vh, vw) jednotek bez jasných pravidel
   - Nadměrné spoléhání na JavaScript pro přepínání layoutů namísto CSS media queries

4. **Typová bezpečnost**

   - Absence TypeScriptu nebo PropTypes pro typovou kontrolu

5. **Testování**
   - Chybí jakékoliv testy (unit, integration, E2E)

## Drobná technická doporučení

1. **CSS vylepšení**

   - Použít CSS proměnné i pro stavy komponent, nejen pro globální theming
   - Nahradit manuální spojování tříd knihovnou `classnames` nebo `clsx`
   - Definovat standardní animační trvání a časování jako CSS proměnné
   - Využít CSS Grid named areas pro čitelnější layouty

2. **React komponenty**

   - Zavést memoizaci pro formátovací funkce a přesunout je do sdílených utilit
   - Použít React.memo pro komponenty, které se často překreslují
   - Doplnit PropTypes nebo TypeScript typování

3. **Kódové konvence**

   - Standardizovat pojmenování CSS tříd (kebab-case) a JavaScript proměnných (camelCase)
   - Sjednotit strukturu komponent a přístup k stylování

4. **Asset optimalizace**

   - Integrovat image optimalizaci do build procesu
   - Standardizovat formáty (SVG pro vektorové, WebP pro fotografické)
   - Implementovat verzování assetů pro lepší cache management

5. **WebSocket vylepšení**
   - Refaktorovat WebSocketManager na třídu se Singleton patterntem
   - Přidat timeout/retry mechanismus s exponenciálním back-off

## Checklist priorit

### Nezbytné

- [ ] Odstranit duplikaci formátovacích funkcí mezi komponentami
- [ ] Vyřešit problematické stavové řízení v ScrollManager
- [ ] Posílit typovou kontrolu (alespoň základní PropTypes)

### Velmi doporučené

- [ ] Refaktorovat CSS architekturu - vytvořit sdílené styly pro animace, layout, typografii
- [ ] Integrovat asset optimalizaci do build procesu
- [ ] Revidovat přístupnost komponent (ARIA role, keyboard navigation, barevný kontrast)
- [ ] Implementovat základní sadu testů

### Doporučené

- [ ] Přejít na jednotný systém pojmenování CSS tříd
- [ ] Použít utility jako classnames pro generování názvů tříd
- [ ] Refaktorovat WebSocketClient na třídu se Singleton patternem
- [ ] Používat useCallback a useMemo konzistentně v celé aplikaci

### Náměty ke zlepšení

- [ ] Migrace celého projektu na TypeScript
- [ ] Zvážit CSS-in-JS knihovnu pro lepší encapsulaci stylů
- [ ] Vytvořit dokumentaci komponent pomocí nástroje jako Storybook
- [ ] Zavést end-to-end testy pro kritické uživatelské scénáře

#

# Instrukce pro AI: Refaktorování Scoreboard aplikace

Tyto instrukce popisují, jak postupovat při refaktorování Scoreboard aplikace podle identifikovaných problémů v kódové revizi. Každá kapitola obsahuje konkrétní instrukce pro řešení jednotlivých položek.

## 1. Odstranění duplikace formátovacích funkcí

### Problém

Formátovací funkce jako `formatName()` jsou duplikovány v několika komponentách.

### Dotčené soubory

- **Nový soubor:** `src/utils/formatUtils.js`
- **Existující soubory:**
  - `src/components/display/CurrentCompetitor.jsx`
  - `src/components/display/OnCourseDisplay.jsx`
  - `src/components/display/ResultsList.jsx`
  - `src/components/display/Top10Display.jsx`

### Kontext

Pro pochopení problému potřebuješ vidět, jak jsou formátovací funkce implementovány v různých komponentách. Požádej o zobrazení těchto souborů.

### Řešení

1. Vytvoř nový soubor `src/utils/formatUtils.js`, který bude obsahovat:

   - `formatName(name)`: formátování jmen závodníků
   - `formatTimeToStart(seconds)`: formátování času do startu
   - `formatGatePenalties(gates, penaltyClass2, penaltyClass50)`: formátování penalizací

2. V každé komponentě:
   - Odstraň lokální implementace těchto funkcí
   - Importuj funkce z nového utility souboru
   - Aktualizuj volání funkcí podle nových parametrů

## 2. Refaktorování stavového řízení v ScrollManager

### Problém

ScrollManager používá komplexní imperativní stavový stroj, což je náchylné k chybám a těžko testovatelné.

### Dotčené soubory

- `src/utils/ScrollManager.js`

### Kontext

Potřebuješ vidět strukturu ScrollManager, zejména jak jsou definovány stavy a přechody mezi nimi.

### Řešení

1. Implementuj reducer pattern pro správu stavu:

   - Definuj hlavní stavy jako konstanty
   - Vytvoř funkci `scrollReducer(state, action)`
   - Nahraď přímé manipulace se stavem voláním dispatch

2. Odděl akce pro manipulaci s DOM od správy stavu:

   - Vytvoř čisté funkce pro scrollování
   - Vyhni se přímým manipulacím s DOM v reducer logice

3. Implementuj jednoduché a čitelné přechody mezi stavy

## 3. Posílení typové kontroly (PropTypes)

### Problém

Komponenty nemají definované PropTypes, což snižuje bezpečnost typů a zhoršuje čitelnost kódu.

### Dotčené soubory

- Všechny komponenty v `src/components/display/`
- Všechny komponenty v `src/components/ui/`
- Všechny komponenty v `src/components/config/`

### Kontext

Pro pochopení struktury komponent a jejich props potřebuješ vidět komponenty, např. `CurrentCompetitor.jsx`.

### Řešení

1. Nainstaluj balíček:

   ```bash
   npm install prop-types --save
   ```

2. Pro každou komponentu:
   - Importuj `PropTypes`
   - Definuj `Component.propTypes` a `Component.defaultProps`
   - Použij vhodné validátory pro každý typ (string, bool, array, object, atd.)
   - Pro složené objekty použij `PropTypes.shape()`

## 4. Refaktorování CSS architektury

### Problém

CSS architektura trpí duplicitou kódu, nekonzistentním pojmenováním a nedostatečnou strukturou.

### Dotčené soubory

- **Nové soubory:**
  - `src/styles/shared/animations.css`
  - `src/styles/shared/variables.css`
  - `src/styles/shared/utils.css`
  - `src/styles/shared/layout.css`
- **Existující soubory:**
  - `src/styles/main.css`
  - Všechny soubory v `src/styles/components/`

### Kontext

Potřebuješ vidět obsah CSS souborů, zejména duplicitní animace a společné styly.

### Řešení

1. Vytvoř adresářovou strukturu:

   ```
   src/styles/
   ├── shared/
   │   ├── animations.css
   │   ├── variables.css
   │   ├── utils.css
   │   └── layout.css
   ├── components/
   │   └── ...
   └── main.css
   ```

2. Přesuň společné animace do `animations.css`:

   - `fadeIn`, `fadeOut`, `pulseGlyph`, `subtlePulse`, atd.
   - Přidej CSS proměnné pro doby trvání a easing

3. Přesuň všechny CSS proměnné z `main.css` do `variables.css`

4. V komponentových CSS souborech:
   - Importuj sdílené soubory pomocí `@import`
   - Odstraň duplicitní kód
   - Používej sdílené proměnné a animace

## 5. Integrace optimalizace assetů do build procesu

### Problém

Skripty pro optimalizaci assetů vyžadují manuální spuštění a nejsou součástí běžného build procesu.

### Dotčené soubory

- `package.json`
- `scripts/prepare-assets.js`
- `scripts/flags-to-base64.cjs`
- **Nový soubor:** `scripts/optimizeImages.js` (pokud neexistuje)

### Kontext

Potřebuješ vidět obsah `package.json` a jak jsou skripty pro správu assetů implementovány.

### Řešení

1. Aktualizuj `package.json` pro integraci skriptů:

   ```json
   "scripts": {
     "prepare-assets": "node scripts/prepare-assets.js",
     "optimize-flags": "node scripts/flags-to-base64.cjs",
     "optimize-images": "node scripts/optimizeImages.js",
     "prebuild": "npm run prepare-assets && npm run optimize-flags && npm run optimize-images",
     "build": "vite build",
     "preview": "vite preview"
   }
   ```

2. Implementuj nebo vylepši skript `optimizeImages.js` s použitím knihovny Sharp:
   - Nainstaluj závislost: `npm install sharp --save-dev`
   - Implementuj optimalizaci pro PNG, JPG a SVG

## 6. Jednotný systém pojmenování CSS tříd

### Problém

Aplikace míchá kebab-case a camelCase konvence pro pojmenování CSS tříd.

### Dotčené soubory

- Všechny CSS soubory v `src/styles/`
- Všechny JSX komponenty, které používají třídy

### Kontext

Potřebuješ vidět příklady nekonzistentního pojmenování tříd v CSS a JSX souborech.

### Řešení

1. Standardizuj všechny CSS třídy na kebab-case:

   ```css
   /* Před */
   .competitorRow {
     /* ... */
   }

   /* Po */
   .competitor-row {
     /* ... */
   }
   ```

2. Vytvoř skript pro kontrolu konzistence: `scripts/check-css-naming.js`

   - Přidej skript do npm scripts: `"lint:css": "node scripts/check-css-naming.js"`

3. Postupně aktualizuj komponenty a CSS soubory:

   ```jsx
   // Před
   <div className="competitorRow">

   // Po
   <div className="competitor-row">
   ```

## 7. Použití utility pro generování názvů tříd

### Problém

Aplikace používá manuální spojování řetězců pro dynamické třídy, což je náchylné k chybám.

### Dotčené soubory

- Všechny React komponenty, které dynamicky generují názvy tříd

### Kontext

Potřebuješ vidět aktuální způsob generování názvů tříd v komponentách.

### Řešení

1. Nainstaluj knihovnu `clsx`:

   ```bash
   npm install clsx --save
   ```

2. Aktualizuj komponenty:

   ```jsx
   // Před
   <div className={`result-row ${isHighlighted ? "highlight" : ""}`}>

   // Po
   import clsx from 'clsx';

   <div className={clsx('result-row', { highlight: isHighlighted })}>
   ```

## 8. Refaktorování WebSocketClient na Singleton třídu

### Problém

WebSocketClient používá globální proměnné a funkce mimo React životní cyklus, což může způsobit paměťové úniky.

### Dotčené soubory

- `src/components/core/WebSocketClient.jsx`
- `src/App.jsx` (pro aktualizaci způsobu použití)

### Kontext

Potřebuješ vidět aktuální implementaci WebSocketClient a jak je používána v aplikaci.

### Řešení

1. Refaktoruj WebSocketClient na Singleton třídu:

   - Vytvoř třídu `WebSocketService` se statickou metodou `getInstance()`
   - Přesuň globální proměnné do vlastností třídy
   - Implementuj metody pro správu připojení, posluchačů a zpracování zpráv

2. Implementuj timeout a exponenciální back-off pro opětovné pokusy o připojení

3. Aktualizuj React Context a Provider pro použití nové třídy

## 9. Konzistentní použití useCallback a useMemo

### Problém

Aplikace nekonzistentně používá React hooks pro optimalizaci výkonu.

### Dotčené soubory

- Všechny funkcionální komponenty, zejména ty, které zpracovávají velké objemy dat nebo často se překreslující

### Kontext

Potřebuješ vidět komponenty s potenciálem pro optimalizaci, např. `ResultsList.jsx`.

### Řešení

1. Definuj jasná pravidla pro použití hooks:

   - `useCallback` pro event handlery a funkce v závislostech
   - `useMemo` pro výpočetně náročné transformace dat
   - Explicitní dependency arrays

2. Optimalizuj kritické komponenty:

   ```jsx
   // Transformace dat
   const filteredData = useMemo(
     () => {
       // Implementace
     },
     [
       /* závislosti */
     ]
   );

   // Event handler
   const handleScroll = useCallback(
     () => {
       // Implementace
     },
     [
       /* závislosti */
     ]
   );
   ```

3. Pro složité podkomponenty použij `React.memo`

## 10. Implementace základní testovací sady

### Problém

Aplikace nemá žádné automatizované testy, což ztěžuje refaktoring a údržbu.

### Dotčené soubory

- **Nové soubory:**
  - `jest.config.js`
  - `setupTests.js`
  - `__mocks__/fileMock.js`
  - `__mocks__/styleMock.js`
  - Testovací soubory pro každou komponentu a utilitu
- **Existující soubory:**
  - `package.json` (pro přidání testovacích skriptů)

### Kontext

Potřebuješ znát strukturu komponent a utilit pro vytvoření smysluplných testů.

### Řešení

1. Nainstaluj potřebné závislosti:

   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @babel/preset-react @babel/preset-env
   ```

2. Vytvoř konfigurační soubory:

   - `jest.config.js`
   - `setupTests.js`
   - Mock soubory pro assety a styly

3. Přidej testovací skripty do `package.json`:

   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage"
   }
   ```

4. Implementuj testy pro:
   - Utility funkce: `formatUtils.test.js`
   - Jednoduché komponenty: `TimeDisplay.test.jsx`
   - WebSocketService: `WebSocketClient.test.js`
