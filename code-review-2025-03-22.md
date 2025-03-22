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
