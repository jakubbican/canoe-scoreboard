# TODO

- [ ] skinovatelnost/vyčištění umístění a parametrizace stylizace
- [ ] true responsivita

- [ ] ! korektní výsledky 2 jízd na better score
- [ ] zobrazení umístění po dojetí v aktivní řádce - možná bude muset počkat na zvládnuté závody na 2 jízdy

- [ ] h2r graphics

## Kroky z code review 2025/03

### Nezbytné (Must Have)

-   [X] **Nahradit zastaralý `<marquee>` tag** CSS animacemi.
-   [X] **Odstranit duplikaci formátovacích funkcí** - centralizovat do `src/utils/formatUtils.js`.
-   [ ] **Refaktorovat stavové řízení v `ScrollManager`** - použít např. reducer pattern pro zjednodušení logiky a zlepšení testovatelnosti.
-   [ ] **Posílit typovou kontrolu** - přidat alespoň základní `PropTypes` ke všem komponentám.

### Velmi doporučené (Should Have)

-   [X] **Refaktorovat CSS architekturu** - vytvořit sdílené styly (`animations.css`, `variables.css`, `layout.css`, `utils.css`), odstranit duplicitu v komponentách.
-   [-] **Integrovat asset optimalizaci** (obrázky, flagy) do build procesu (`prebuild` skript).
-   [-] **Revidovat přístupnost** - doplnit ARIA atributy, zkontrolovat kontrast barev, zajistit základní ovladatelnost klávesnicí.
-   [ ] **Implementovat základní sadu unit testů** pro utility a klíčové komponenty (např. pomocí Jest a React Testing Library).
-   [X] **Refaktorovat `WebSocketClient`** na Singleton třídu s lepším řízením reconnectů.

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



# DONE

- [X] stacking záhlaví + info text na LED (DONE)
- [X] logo SK VS CB
- [X] kategorie z oncourse do title
- [X] filtrovat oncourse jen na ty, co mají čas
- [X] více než 30 výsledků
- [X] update recommended resolution of images in README
- [X] vyhodit hover animace
- [X] klik na status do konfigurace
- [X] tvrdý refresh v konfig panelu
- [X] scrollování výsledků a najíždění na dojetého závodníka
- [X] update images for SKVSCB standard (footer)
- [X] disable scrolling option
- [X] disrupted scrolling after data arrives
- [X] disrupted scrolling after data arrives
- [X] zrušit divný vizuální efekt na celém seznamu vertical po dojetí jezdce na nějaké nižší obrazovce
- [X] screenshots
- [X] cleanup komentářů a všech souborů
- [X] Schedule
- [X] TOP10
- [X] code review
- [X] assets referencing when app in folder!!

# WON'T DO

- [ ] ??zobrazit oncourse vedle sebe na ledwall
- [ ] hide incomplete rows from the results scrolling viewport
- [ ] ?OnStart
