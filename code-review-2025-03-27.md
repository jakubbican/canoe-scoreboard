# Hodnocení kódu: Scoreboard aplikace (Verze 2 - Kombinovaná revize)

Tento dokument kombinuje zjištění z původní AI revize a manuální revize ze dne 2025-03-22.

## Principiální připomínky

1.  **Organizace CSS**
    *   Duplicita kódu mezi komponentami (stejné animace, podobné styly).
    *   Chybí jednotný systém pojmenování tříd (střídá se kebab-case a camelCase).
    *   Některé CSS soubory jsou příliš dlouhé a nepřehledné (`ScheduleDisplay.css`, `Top10Display.css`).
    *   Potenciálně nevyužívané nebo přepsané styly (např. pro `.stacked-components`).

2.  **Správa stavu**
    *   `ScrollManager` používá složitý imperativní stavový stroj, který je obtížně spravovatelný a testovatelný, zejména při zpracování přerušení (highlight).
    *   `WebSocketClient` používá globální proměnné a funkce mimo React lifecycle, což zvyšuje riziko memory leaků a ztěžuje testování.

3.  **Modularita a znovupoužitelnost**
    *   Komponenty jako `CurrentCompetitor` a `OnCourseDisplay` sdílejí významnou část logiky a struktury (formátování jmen, struktura řádku), ale nejsou optimalizovány pro znovupoužití (např. sdílenou komponentou `CompetitorRowDisplay`).
    *   Formátovací funkce (`formatName`, `formatTimeToStart`, atd.) jsou duplikovány v různých komponentách místo centralizace v utilitách.

4.  **Přístupnost**
    *   Chybí explicitní řešení přístupnosti (ARIA role, focus management, navigace klávesnicí).
    *   Některé barevné kombinace (zejména v grafech nebo stavech) nemusí splňovat požadavky na minimální kontrastní poměr WCAG.

## Technické připomínky

1.  **Použití zastaralých technologií**
    *   Použití **zastaralého HTML tagu `<marquee>`** v `EventInfo.jsx` pro běžící text. Tento tag je nespolehlivý, neefektivní a nekompatibilní s moderními standardy. Měl by být nahrazen CSS animacemi.

2.  **Správa assetů**
    *   Skripty pro přípravu a optimalizaci assetů (`prepare-assets.js`, `flags-to-base64.cjs`, `optimizeImages.js`) vyžadují manuální spouštění a nejsou integrovány do standardního build procesu (`npm run build`).
    *   Chybí automatická optimalizace obrázků (např. konverze do moderních formátů jako WebP, komprese).

3.  **Optimalizace výkonu**
    *   Některé CSS animace (zejména ty aplikované na layout) mohou způsobovat zbytečný "layout thrashing".
    *   Nekonzistentní a potenciálně nedostatečné použití React optimalizačních technik jako `React.memo`, `useMemo`, `useCallback`.

4.  **Reaktivita a responsivita**
    *   Míchání absolutních (`px`) a relativních (`vh`, `vw`) jednotek v CSS bez jasně definované strategie, což může komplikovat škálování.
    *   Nadměrné spoléhání na JavaScript (v `LayoutManager`) pro aplikaci stylů specifických pro layout namísto využití čistých CSS řešení jako media queries nebo container queries (kde je to vhodné).

5.  **Typová bezpečnost**
    *   Absence TypeScriptu nebo alespoň `PropTypes` pro validaci props komponent, což zvyšuje riziko runtime chyb a zhoršuje developer experience.

6.  **Testování**
    *   Aplikace postrádá jakékoliv automatizované testy (unit, integration, E2E), což výrazně ztěžuje bezpečný refaktoring a údržbu.

## Drobná technická doporučení

1.  **CSS vylepšení**
    *   Použít CSS proměnné i pro dynamické stavy komponent (např. highlight barvy, rozměry), nejen pro globální theming.
    *   Nahradit manuální spojování CSS tříd v JSX standardizovanou knihovnou jako `classnames` nebo `clsx` pro lepší čitelnost a údržbu.
    *   Definovat standardní délky trvání animací a časovací funkce (`easing`) jako CSS proměnné pro konzistenci.
    *   Využít CSS Grid `grid-template-areas` pro definici layoutu v komplexnějších komponentách (např. `ResultsList`, `Top10Display`) pro lepší čitelnost kódu.

2.  **React komponenty**
    *   Centralizovat a memoizovat formátovací funkce v `src/utils/`.
    *   Použít `React.memo` pro optimalizaci komponent, které dostávají stejné props, ale zbytečně se překreslují.
    *   Doplnit `PropTypes` jako minimum pro typovou kontrolu props.

3.  **Kódové konvence**
    *   Sjednotit pojmenování CSS tříd na `kebab-case`.
    *   Sjednotit pojmenování JavaScript proměnných a funkcí na `camelCase`.
    *   Zajistit konzistentní strukturu souborů a importů napříč projektem.

4.  **Asset optimalizace**
    *   Integrovat optimalizaci obrázků (např. pomocí `sharp`) do `prebuild` skriptu v `package.json`.
    *   Preferovat moderní formáty jako WebP pro rastrové obrázky a SVG pro vektorové ikony/loga.
    *   Zvážit implementaci verzování assetů (např. pomocí hashů v názvech souborů) pro efektivnější cache busting.

5.  **WebSocket vylepšení**
    *   Refaktorovat `WebSocketManager` na třídu implementující `Singleton` pattern pro zajištění jediné instance a lepší enkapsulaci.
    *   Implementovat robustnější mechanismus pro opětovné připojení s exponenciálním back-off (postupné prodlužování intervalů mezi pokusy).

6.  **Custom Event (`athleteFinished`)**
    *   Přezkoumat účel custom eventu `athleteFinished` dispatchovaného z `CurrentCompetitor` a `OnCourseDisplay`. Pokud není využíván, odstranit ho. Pokud ano, zvážit jeho nahrazení React-nativnějším přístupem (callback props, context).

## Checklist priorit

### Nezbytné (Must Have)

-   [ ] **Nahradit zastaralý `<marquee>` tag** CSS animacemi.
-   [ ] **Odstranit duplikaci formátovacích funkcí** - centralizovat do `src/utils/formatUtils.js`.
-   [ ] **Refaktorovat stavové řízení v `ScrollManager`** - použít např. reducer pattern pro zjednodušení logiky a zlepšení testovatelnosti.
-   [ ] **Posílit typovou kontrolu** - přidat alespoň základní `PropTypes` ke všem komponentám.

### Velmi doporučené (Should Have)

-   [ ] **Refaktorovat CSS architekturu** - vytvořit sdílené styly (`animations.css`, `variables.css`, `layout.css`, `utils.css`), odstranit duplicitu v komponentách.
-   [ ] **Integrovat asset optimalizaci** (obrázky, flagy) do build procesu (`prebuild` skript).
-   [ ] **Revidovat přístupnost** - doplnit ARIA atributy, zkontrolovat kontrast barev, zajistit základní ovladatelnost klávesnicí.
-   [ ] **Implementovat základní sadu unit testů** pro utility a klíčové komponenty (např. pomocí Jest a React Testing Library).
-   [ ] **Refaktorovat `WebSocketClient`** na Singleton třídu s lepším řízením reconnectů.

### Doporučené (Could Have)

-   [ ] **Sjednotit pojmenování CSS tříd** na `kebab-case` v celé aplikaci.
-   [ ] **Použít utility jako `clsx`** pro dynamické generování názvů tříd v JSX.
-   [ ] **Konzistentně používat `useCallback` a `useMemo`** pro optimalizaci výkonu tam, kde je to opodstatněné.
-   [ ] **Vytvořit sdílenou komponentu `CompetitorRowDisplay`** pro `CurrentCompetitor` a `OnCourseDisplay`.

### Náměty ke zlepšení (Won't Have / Future)

-   [ ] Migrace celého projektu na **TypeScript**.
-   [ ] Zvážit použití **CSS-in-JS** knihovny (např. Styled Components, Emotion) pro lepší enkapsulaci stylů.
-   [ ] Vytvořit dokumentaci komponent pomocí nástroje jako **Storybook**.
-   [ ] Zavést **end-to-end testy** (např. pomocí Cypress nebo Playwright) pro kritické uživatelské scénáře.

---

# Instrukce pro AI: Refaktorování Scoreboard aplikace

Tyto instrukce popisují, jak postupovat při refaktorování Scoreboard aplikace podle identifikovaných problémů v kombinované kódové revizi. Každá kapitola obsahuje konkrétní instrukce pro řešení jednotlivých položek.

## 1. Nahrazení `<marquee>` CSS animacemi

### Problém

Komponenta `EventInfo.jsx` používá zastaralý a nespolehlivý HTML tag `<marquee>` pro běžící text.

### Dotčené soubory

-   `src/components/display/EventInfo.jsx`
-   `src/styles/components/EventInfo.css`
-   `src/styles/shared/animations.css` (nový nebo existující)

### Kontext

Potřebuješ vidět, jak je `<marquee>` aktuálně použit v `EventInfo.jsx` a stylován v `EventInfo.css`.

### Řešení

1.  **V `EventInfo.jsx` (`InfoText` komponenta):**
    *   Nahraď `<marquee>` tag standardním `<div>` elementem.
    *   Vnitřní text obal do dalšího `<span>` nebo `<div>` elementu, který bude animován.

    ```jsx
    // Před
    <marquee scrollamount={...} ...>
        {infoText}
    </marquee>

    // Po
    <div className={`info-marquee-container ${displayType}`}>
        <div className="info-marquee-content" style={{ animationDuration: getAnimationDuration(infoText) }}>
            {infoText}
        </div>
    </div>
    ```
    *(Poznámka: Přidána dynamická `animationDuration` přes inline styl, pokud je rychlost závislá na délce textu)*

2.  **V `src/styles/shared/animations.css` (nebo vytvoř):**
    *   Definuj `@keyframes` pro horizontální posun.

    ```css
    /* Plynulý nekonečný scroll */
    @keyframes marquee-scroll-left {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); } /* Posun o celou šířku obsahu */
    }
    ```

3.  **V `src/styles/components/EventInfo.css`:**
    *   Styly pro `.info-marquee-container`:
        *   Nastav `overflow: hidden;`
        *   Nastav `white-space: nowrap;`
        *   Nastav `width: 100%; height: 100%;`
        *   Nastav `display: flex; align-items: center;` (pro vertikální zarovnání)
    *   Styly pro `.info-marquee-content`:
        *   Aplikuj animaci: `animation: marquee-scroll-left linear infinite;`
        *   `display: inline-block;`
        *   `padding-left: 100%;` /* Začne mimo obrazovku vpravo */
        *   `will-change: transform;` /* Optimalizace výkonu */
    *   Odstraň veškeré styly specifické pro `<marquee>`.

4.  **V `EventInfo.jsx` (`InfoText` komponenta):**
    *   Implementuj funkci `getAnimationDuration(text)` pro výpočet doby trvání animace na základě délky textu a požadované rychlosti. Delší text = delší trvání pro stejnou rychlost.

## 2. Odstranění duplikace formátovacích funkcí

### Problém

Formátovací funkce jako `formatName()` jsou duplikovány v několika komponentách.

### Dotčené soubory

-   **Nový soubor:** `src/utils/formatUtils.js`
-   **Existující soubory:**
    -   `src/components/display/CurrentCompetitor.jsx`
    -   `src/components/display/OnCourseDisplay.jsx`
    -   `src/components/display/ResultsList.jsx`
    -   `src/components/display/Top10Display.jsx`
    -   `src/components/display/OnStartDisplay.jsx` (pro `formatTimeToStart`)

### Kontext

Pro pochopení problému potřebuješ vidět, jak jsou formátovací funkce implementovány v různých komponentách. Požádej o zobrazení těchto souborů.

### Řešení

1.  Vytvoř nový soubor `src/utils/formatUtils.js`, který bude obsahovat exportované funkce:
    *   `export function formatName(name) { /* ... implementace ... */ }`
    *   `export function formatTimeToStart(seconds) { /* ... implementace z OnStartDisplay ... */ }`
    *   `export function formatGatePenalty(penalty, index) { /* ... implementace pro generování dat (např. { gateNumber, penaltyClass }) ... */ }`
        *   Vrací objekt s daty, ne JSX. Komponenta se postará o renderování.
        ```javascript
        export function formatGatePenaltyData(penaltyString) {
            if (!penaltyString) return [];
            return penaltyString.split(',').map((penalty, index) => {
                if (!penalty || penalty === '0') return null;
                const penaltyValue = parseInt(penalty, 10);
                const gateNumber = index + 1;
                const penaltyClass = penaltyValue >= 50 ? 'penalty-50' : 'penalty-2'; // Nebo vracíme jen hodnotu?
                return { gateNumber, penaltyClass, rawValue: penalty };
            }).filter(Boolean);
        }
        ```

2.  V každé dotčené komponentě:
    *   Odstraň lokální implementace těchto funkcí.
    *   Importuj potřebné funkce z `src/utils/formatUtils.js`.
    *   Aktualizuj volání funkcí v JSX.
    *   Pro `formatGatePenaltyData`: Zpracuj vrácené pole objektů a vyrenderuj `<span>` elementy v komponentě.

## 3. Refaktorování stavového řízení v ScrollManager

### Problém

`ScrollManager` používá komplexní imperativní stavový stroj, což je náchylné k chybám a těžko testovatelné.

### Dotčené soubory

-   `src/utils/ScrollManager.js`
-   `src/components/display/ResultsList.jsx` (může být potřeba upravit interakci)

### Kontext

Potřebuješ vidět strukturu `ScrollManager.js`, zejména jak jsou definovány proměnné `this.phase`, `this.timer`, `this.isPaused`, `this.isDisabled` a metody jako `setPhase`, `start`, `stop`, `scrollNextPage`, `handleAtBottom`, `scrollToHighlight`.

### Řešení

1.  **Definuj stavy a akce (jako konstanty):**
    ```javascript
    const PHASES = { IDLE: 'IDLE', INITIAL_DELAY: 'INITIAL_DELAY', ... };
    const ACTIONS = { START: 'START', STOP: 'STOP', ... };
    ```
2.  **Implementuj Reducer (jako metoda třídy nebo samostatná funkce):**
    ```javascript
    #scrollReducer(state, action) {
        switch (action.type) {
            case ACTIONS.START:
                if (state.phase === PHASES.IDLE && !state.isDisabled) {
                    return { ...state, phase: PHASES.INITIAL_DELAY, currentRowIndex: 0, isPaused: false };
                }
                return state;
            case ACTIONS.SCROLL_PAGE_COMPLETE:
                 if (state.phase === PHASES.SCROLLING) {
                    // Vypočítat nový index, zkontrolovat konec
                    const nextIndex = state.currentRowIndex + action.payload.rowsPerPage;
                    if (nextIndex >= action.payload.totalRows -1) {
                        return { ...state, phase: PHASES.PAUSED_AT_BOTTOM, currentRowIndex: action.payload.totalRows - 1 };
                    }
                     return { ...state, currentRowIndex: nextIndex };
                 }
                 return state;
            // ... další případy pro REACHED_BOTTOM, RETURN_TO_TOP_COMPLETE, SHOW_HIGHLIGHT, HIGHLIGHT_TIMEOUT atd. ...
            default:
                return state;
        }
    }
    ```
3.  **Uprav metody pro dispatch akcí a správu side effects:**
    *   Metody jako `start`, `stop`, `scrollNextPage` budou volat `this.#dispatch(action)` pro změnu stavu.
    *   Po dispatchnutí může metoda spustit side effect (nastavit timer, zavolat `scrollTo`) na základě nového stavu.
    ```javascript
    #dispatch(action) {
        const oldState = this.state;
        const newState = this.#scrollReducer(oldState, action);
        this.state = newState; // Ulož nový stav
        this.#handleSideEffects(newState, oldState, action); // Spusť side effects
        this.#notifyPhaseChange(newState.phase, oldState.phase); // Notifikuj listenery
    }

    #handleSideEffects(newState, oldState, action) {
        // Zrušení starých timerů
        if (newState.phase !== oldState.phase) { // Nebo na základě specifických přechodů
             this.#clearTimer();
        }

        // Spuštění nových timerů nebo akcí
        switch (newState.phase) {
            case PHASES.INITIAL_DELAY:
                this.#setTimer(() => this.#dispatch({ type: ACTIONS.START_SCROLLING }), this.config.initialDelay);
                break;
            case PHASES.SCROLLING:
                 this.#performScroll(newState.currentRowIndex); // Funkce, která volá scrollTo
                 this.#setTimer(() => this.#dispatch({ type: ACTIONS.REQUEST_NEXT_PAGE }), this.config.pageInterval);
                 break;
            // ... další případy ...
        }
    }
    ```
4.  Přejmenuj interní proměnné (např. `this.phase` na `this.state.phase`).

## 4. Posílení typové kontroly (PropTypes)

### Problém

Komponenty nemají definované `PropTypes`, což snižuje bezpečnost typů a zhoršuje čitelnost kódu.

### Dotčené soubory

-   Všechny komponenty v `src/components/display/`
-   Všechny komponenty v `src/components/ui/`
-   Všechny komponenty v `src/components/config/`

### Kontext

Pro pochopení struktury komponent a jejich props potřebuješ vidět kód komponent, např. `CurrentCompetitor.jsx`, `ResultsList.jsx`, `ConfigPanel.jsx`.

### Řešení

1.  Nainstaluj balíček, pokud ještě není:
    ```bash
    npm install prop-types --save
    ```
2.  Pro každou funkcionální komponentu (např. `ResultsList`):
    *   Na začátek souboru přidej `import PropTypes from 'prop-types';`.
    *   Na konec souboru (před `export default`) přidej definici `propTypes`:

    ```jsx
    ResultsList.propTypes = {
        data: PropTypes.shape({
            list: PropTypes.arrayOf(PropTypes.shape({
                Rank: PropTypes.string,
                Bib: PropTypes.string.isRequired, // Bib je klíčový
                Name: PropTypes.string,
                Pen: PropTypes.string,
                Total: PropTypes.string,
                Behind: PropTypes.string,
            })),
            RaceName: PropTypes.string,
            CurrentCompetitorActive: PropTypes.string, // '1' or '0'
            OnCourseActive: PropTypes.string, // '1' or '0'
            HighlightBib: PropTypes.string,
        }),
        visible: PropTypes.bool.isRequired,
        highlightBib: PropTypes.number, // Upraveno z ResultsList useEffect
    };

    ResultsList.defaultProps = {
        data: { list: [] },
        highlightBib: null,
    };
    ```
3.  Použij správné typy a `.isRequired` tam, kde je to nutné. Pro komplexní objekty nebo pole objektů používej `PropTypes.shape` a `PropTypes.arrayOf`.

## 5. Refaktorování CSS architektury

### Problém

CSS architektura trpí duplicitou kódu, nekonzistentním pojmenováním a nedostatečnou strukturou.

### Dotčené soubory

-   **Nové soubory:**
    -   `src/styles/shared/animations.css`
    -   `src/styles/shared/variables.css`
    -   `src/styles/shared/utils.css` (pro utility třídy jako `.hidden`)
    -   `src/styles/shared/layout-base.css` (pro základní layout prvky)
-   **Existující soubory:**
    -   `src/styles/main.css`
    -   Všechny soubory v `src/styles/components/`
    -   `src/styles/layout.css`

### Kontext

Potřebuješ vidět obsah CSS souborů, zejména `main.css`, `layout.css` a několik komponentových CSS (např. `CurrentCompetitor.css`, `ResultsList.css`), aby bylo možné identifikovat společné části.

### Řešení

1.  **Vytvoř adresář `src/styles/shared/`**.
2.  **Přesuň CSS proměnné:** Všechny proměnné z `:root` v `main.css` přesuň do `src/styles/shared/variables.css`.
3.  **Centralizuj animace:** Najdi definice `@keyframes` a přesuň je do `src/styles/shared/animations.css`.
4.  **Vytvoř utility třídy:** Přesuň `.hidden`, `.transparent` atd. do `src/styles/shared/utils.css`.
5.  **Základní layout:** Přesuň obecná pravidla pro `.scoreboard-layout`, `.scoreboard-container` atd. do `src/styles/shared/layout-base.css`. `src/styles/layout.css` bude obsahovat hlavně `layout-*` specifická pravidla.
6.  **Importuj sdílené styly:** V `src/styles/main.css` importuj sdílené soubory (`@import './shared/variables.css';` atd.).
7.  **Odstraň duplicitu:** Projdi komponentové CSS a odstraň pravidla definovaná ve sdílených souborech.

## 6. Integrace optimalizace assetů do build procesu

### Problém

Skripty pro optimalizaci assetů vyžadují manuální spuštění a nejsou součástí běžného build procesu.

### Dotčené soubory

-   `package.json`
-   `scripts/prepare-assets.js` (zajistit, aby běžel první)
-   `scripts/flags-to-base64.cjs`
-   `scripts/optimizeImages.js` (vytvořit nebo upravit)
-   `vite.config.js` (alternativa k `prebuild` skriptu pomocí Vite pluginu)

### Kontext

Potřebuješ vidět obsah `package.json` (sekci `scripts`) a existující skripty pro assety.

### Řešení

1.  **Implementuj/Vylepši `scripts/optimizeImages.js`:** Použij `sharp` pro optimalizaci PNG/JPG a `svgo` pro SVG.
2.  **Aktualizuj `package.json`:**
    *   Přidej `prebuild` skript, který postupně spustí `prepare-assets`, `optimize-flags` a `optimize-images`.
    ```json
    "scripts": {
      "dev": "vite",
      "prepare-assets": "node scripts/prepare-assets.js",
      "optimize-flags": "node scripts/flags-to-base64.cjs",
      "optimize-images": "node scripts/optimizeImages.js",
      "prebuild": "npm run prepare-assets && npm run optimize-flags && npm run optimize-images",
      "build": "vite build",
      // ...
    }
    ```
3.  **(Alternativa) Vite Plugin:** Místo `prebuild` skriptu lze vytvořit vlastní Vite plugin, který by tyto operace provedl během build procesu Vite (např. v hooku `buildStart` nebo `writeBundle`). To může být čistší integrace.

## 7. Jednotný systém pojmenování CSS tříd

### Problém

Aplikace míchá `kebab-case` a `camelCase` konvence pro pojmenování CSS tříd.

### Dotčené soubory

-   Všechny CSS soubory v `src/styles/`
-   Všechny JSX komponenty, které používají `className`

### Kontext

Potřebuješ vidět příklady nekonzistentního pojmenování, např. `.competitorRow` vs `.config-panel`.

### Řešení

1.  **Zvol konvenci:** `kebab-case`.
2.  **Systematicky projdi a přejmenuj** třídy v `.css` souborech.
3.  **Systematicky projdi a aktualizuj** `className` v `.jsx` souborech.
4.  **(Volitelné) Nainstaluj a konfiguruj `stylelint`** s pravidlem `selector-class-pattern: "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$"` pro vynucení konvence.

## 8. Použití utility pro generování názvů tříd

### Problém

Aplikace používá manuální spojování řetězců nebo ternární operátory pro dynamické `className`.

### Dotčené soubory

-   Všechny React komponenty, které dynamicky přidávají třídy.

### Kontext

Potřebuješ vidět příklady jako `` className={`result-row ${isHighlighted ? "highlight" : ""}`} ``.

### Řešení

1.  Nainstaluj knihovnu `clsx`: `npm install clsx --save`.
2.  Aktualizuj komponenty:
    *   Importuj `clsx`.
    *   Nahraď manuální spojování: `className={clsx('result-row', { highlight: isHighlighted })}`.

## 9. Refaktorování WebSocketClient na Singleton třídu

### Problém

Současná implementace `WebSocketManager` používá globální proměnné. Singleton pattern zajistí lepší enkapsulaci a řízení.

### Dotčené soubory

-   `src/components/core/WebSocketClient.jsx`

### Kontext

Potřebuješ vidět celý soubor `WebSocketClient.jsx`, zejména objekt `WebSocketManager`.

### Řešení

1.  **Vytvoř třídu `WebSocketService`** s privátními vlastnostmi, statickou `getInstance()` metodou a metodami pro `connect`, `disconnect`, `addMessageListener`, `addConnectionListener`.
2.  **Implementuj exponenciální back-off** v `#scheduleReconnect`.
3.  **Aktualizuj `WebSocketProvider`** tak, aby používal `WebSocketService.getInstance()` a jeho metody. Zvaž, zda `disconnect` volat v cleanup funkci `useEffect`.

*(Detailní kód pro `WebSocketService` a úpravu `WebSocketProvider` je v předchozí odpovědi.)*

## 10. Konzistentní použití useCallback a useMemo

### Problém

Aplikace nekonzistentně používá React hooks `useCallback` a `useMemo`.

### Dotčené soubory

-   Všechny funkcionální komponenty, zejména ty složitější nebo často se překreslující.

### Kontext

Potřebuješ vidět definice funkcí (event handlerů) a výpočty prováděné přímo v renderu komponent.

### Řešení

1.  **Aplikuj `useCallback`** na funkce předávané jako props (zejména do `React.memo` komponent) a na funkce používané v dependency arrays jiných hooků.
2.  **Aplikuj `useMemo`** na výpočetně náročné operace nebo na vytváření objektů/polí, které jsou v dependency arrays, aby se zajistila jejich referenční stabilita.
3.  **Obal `contextValue` v `LayoutManager.jsx`** do `useMemo`, aby se zabránilo zbytečným re-renderům konzumentů kontextu.

*(Konkrétní příklady použití jsou v předchozí odpovědi.)*

## 11. Implementace základní testovací sady

### Problém

Aplikace nemá žádné automatizované testy.

### Dotčené soubory

-   **Nové soubory:** Konfigurační soubory Jest/Vitest, mock soubory, testovací soubory (`*.test.js`, `*.test.jsx`).
-   **Existující soubory:** `package.json`

### Kontext

Potřebuješ znát strukturu utilit a jednoduchých komponent pro vytvoření prvních testů.

### Řešení

1.  **Nainstaluj testovací framework:** Doporučuji **Vitest**, protože se lépe integruje s Vite. (`npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`).
2.  **Konfiguruj Vitest:** Přidej sekci `test` do `vite.config.js`.
    ```javascript
    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js', // Soubor pro globální setup
        css: true, // Povolí zpracování CSS (často pomocí identity-obj-proxy)
      },
      // ...
    });
    ```
3.  **Vytvoř `src/setupTests.js`:** `import '@testing-library/jest-dom';`
4.  **Nainstaluj mock pro CSS moduly (pokud je potřeba):** `npm install --save-dev identity-obj-proxy` a přidej do `vite.config.js` `css: { modules: { localsConvention: 'camelCaseOnly' } }` a případně do `moduleNameMapper` v `test` sekci, pokud Vitest automaticky nezpracuje CSS.
5.  **Přidej testovací skripty do `package.json`:**
    ```json
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest",
        "coverage": "vitest run --coverage"
        // ...
    }
    ```
6.  **Napiš první testy** pro utility (`formatUtils.test.js`) a jednoduché komponenty (`TimeDisplay.test.jsx`) pomocí `describe`, `it`, `expect` a `@testing-library/react`.

*(Příklady testů jsou v předchozí odpovědi, syntaxe pro Vitest je velmi podobná Jest.)*

## 12. Revize přístupnosti (Accessibility)

### Problém

Aplikace postrádá explicitní prvky přístupnosti.

### Dotčené soubory

-   Všechny komponenty, CSS soubory.

### Kontext

Projít UI prvky a jejich implementaci.

### Řešení

1.  Používat **sémantické HTML**.
2.  Doplnit **ARIA atributy** (role, stavy, live regions).
3.  Zajistit plnou **ovladatelnost klávesnicí** a viditelný focus.
4.  Zkontrolovat a opravit **barevný kontrast**.
5.  Doplnit **alternativní texty** k obrázkům.

*(Detailní kroky jsou v předchozí odpovědi.)*

## 13. Vytvoření sdílené komponenty `CompetitorRowDisplay`

### Problém

Duplicitní struktura a styly pro zobrazení řádku závodníka v různých komponentách.

### Dotčené soubory

-   `CurrentCompetitor.jsx`, `OnCourseDisplay.jsx`, `ResultsList.jsx`, `Top10Display.jsx` a jejich CSS.
-   Nové soubory pro sdílenou komponentu a její styly.

### Kontext

Porovnat strukturu `.competitor-row`, `.course-row`, `.result-row`, `.top10-row`.

### Řešení

1.  Navrhnout a implementovat **`CompetitorRowDisplay.jsx`** s props pro všechna data a varianty (`variant`, `layoutType`, `isHighlighted`).
2.  Vytvořit **sdílené CSS** (`CompetitorRowDisplay.css`) s modifikátory pro varianty a layouty.
3.  **Refaktorovat původní komponenty**, aby používaly `<CompetitorRowDisplay>` a předávaly správné props.
4.  Vyčistit původní CSS soubory.

*(Detailní návrh komponenty a props je v předchozí odpovědi.)*

## Budoucí náměty (Souhrn)

*   **TypeScript:** Postupná migrace pro typovou bezpečnost.
*   **CSS-in-JS:** Zvážit pro lepší zapouzdření stylů.
*   **Storybook:** Pro izolovaný vývoj a dokumentaci UI.
*   **E2E Testy:** Pro ověření klíčových scénářů.