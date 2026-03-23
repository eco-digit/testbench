# Projekt Styling Guidelines

## Inhaltsverzeichnis

1. [Einleitung](#einleitung)
2. [SCSS-Datei-Struktur](#ordnerstruktur)
3. [Dark Mode](#dark-mode)
4. [Design Tokens](#design-tokens)
5. [Typographie](#typographie)
6. [CSS-Methodologie](#css-methodologie)
7. [Abstände (Margin & Padding)](#abstände-margin--padding)

---

## Einleitung

Dieses Projekt basiert auf:

- **Angular Material** (Material Design Components)
- **Material 3** (M3 Theme für modernes UI-Design)
- **SCSS** (für erweiterte Styling-Möglichkeiten)
- **BEM-Schema** für strukturierte CSS-Klassen

**Wichtig**: Die Design-Entwürfe mit allen Angaben zu Farben, Typographien und Abständen sind in **Figma** zu finden.

## Ordnerstruktur

styles/
│── components.scss # Styling der (Angular Material) Komponenten
│── helpers.scss # Funktionen, Reset, Variables etc.
│── theme.scss # Design Tokens M3 Theme
│── index.scss # Importiert alle Files
│── README.md # Dokumentation zur SCSS-Struktur

## Dark Mode

Der **Dark Mode ist der Standardmodus** des Projekts. Farbwerte und Komponenten werden primär für den Dark Mode optimiert.
Falls ein Light Mode benötigt wird, kann dieser über CSS Custom Properties oder eine separate Klasse (`.light-mode`) gesteuert werden.

## Design Tokens

Die Farben werden mit **Design Tokens** verwaltet, die sich im `_m3-theme`-Ordner befinden. Diese Tokens sind für die konsistente Verwendung von Farben über das gesamte Projekt hinweg vorgesehen.

Beispiel für die Nutzung einer Design Token-Farbe:

```scss
color: var(--sys--primary);
background-color: var(--sys-on-surface);
```

## Typographie

Für die Typographie nutzen wir die Klassen von **Angular Material**. Die Typographien folgen den Material 3 Vorgaben und sind auf [dieser Seite](https://v18.material.angular.io/guide/typography#type-scale-levels) dokumentiert.

### Beispielhafte Verwendung:

```html
<h1 class="mat-display-large">Hauptüberschrift</h1>
<p class="mat-body-medium">Fließtext in mittlerer Größe</p>
```

## CSS-Methodologie

Wir setzen auf das **BEM (Block Element Modifier)**-Schema für eine saubere und verständliche Strukturierung der CSS-Klassen.

### BEM-Konvention:

```scss
.button {
  &__primary {
    background-color: var(--sys-primary);
    color: var(--sys-on-primary);
  }

  &__secondary {
    background-color: var(--sys-secondary);
    color: var(--md-sys-on-secondary);
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

### Beispielhafte Nutzung in HTML:

```html
<button class="button button__primary">Primärer Button</button> <button class="button button__secondary button--disabled">Deaktivierter Button</button>
```

## Abstände (Margin & Padding)

Für Abstände (Margin und Padding) werden **Variablen aus dem `variable`-Ordner** genutzt. Das sorgt für eine einheitliche Gestaltung und verhindert harte Werte im Code.

**Grundsätzlich gilt**: Falls harte Werte notwendig sind, sollte **rem** statt **px** verwendet werden.

### Beispielhafte Nutzung:

```scss
.element {
  margin: var(--spacing-md);
  padding: var(--spacing-lg);
}
```

---

Durch die Einhaltung dieser Richtlinien wird eine **konsistente, skalierbare und wartbare** Codebasis gewährleistet. Bitte halte dich an diese Konventionen, um ein einheitliches Erscheinungsbild und eine gute Zusammenarbeit sicherzustellen.
