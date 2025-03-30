# TODO

- výsledky code review ... 

- skinovatelnost/vyčištění umístění a parametrizace stylizace
- true responsivita

- korektní výsledky 2 jízd na better score
- zobrazení umístění po dojetí v aktivní řádce - možná bude muset počkat na zvládnuté závody na 2 jízdy

## Kroky z code review 2025/03

### Nezbytné (Must Have)

-   [X] **Nahradit zastaralý `<marquee>` tag** CSS animacemi.
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



# DONE

- OK: stacking záhlaví + info text na LED (DONE)
- OK: logo SK VS CB
- OK: kategorie z oncourse do title
- OK: filtrovat oncourse jen na ty, co mají čas
- OK: více než 30 výsledků
- OK: update recommended resolution of images in README
- OK: vyhodit hover animace
- OK: klik na status do konfigurace
- OK: tvrdý refresh v konfig panelu
- OK: scrollování výsledků a najíždění na dojetého závodníka
- OK: update images for SKVSCB standard (footer)
- OK: disable scrolling option
- OK: disrupted scrolling after data arrives
- OK: disrupted scrolling after data arrives
- OK: zrušit divný vizuální efekt na celém seznamu vertical po dojetí jezdce na nějaké nižší obrazovce
- OK: screenshots
- OK: cleanup komentářů a všech souborů
- OK: Schedule
- OK: TOP10
- OK: code review
- OK: assets referencing when app in folder!!

# WON'T DO

- ??zobrazit oncourse vedle sebe na ledwall
- hide incomplete rows from the results scrolling viewport
- ?OnStart
