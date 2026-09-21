# Mathematic Pixel — Design System

## 1. Filosofía Visual

- **Tema**: Cosmos matemático, neón espacial, glassmorphism.
- **Mood**: Inmersivo, futurista, lúdico-educativo.
- **Background**: Siempre oscuro (space gradient + fog overlay). Nunca usar fondos claros.
- **Efectos dominantes**: Glow púrpura/azul, blur cristal, animaciones suaves.

---

## 2. Paleta de Colores

### 2.1 Primarios (Índigo Cósmico)
| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#6c5dd3` | Gradientes principales, sombras glow |
| `--color-secondary` | `#4e7fff` | Gradientes, glow secundario, acentos fríos |
| `--color-accent` | `#9d7bff` | Glow intenso, highlights, bordes luminosos |

### 2.2 Complementarios (Expansión de Paleta)
Estos colores **mantienen la estética neón espacial** y se usan para estados, jerarquía y contraste:

| Token | Hex | Uso |
|---|---|---|
| `--color-cyan` | `#22d3ee` | Info, hints, estados neutros positivos, acento frío alternativo |
| `--color-magenta` | `#ff00aa` | Urgencia suave, destacados especiales, energía |
| `--color-gold` | `#ffd700` | Warnings, puntos clave, logros, estrellas doradas |
| `--color-orange` | `#f59e0b` | Badges cálidos (exámenes), acentos de energía media |
| `--color-mint` | `#10d97a` | Éxito, respuestas correctas |
| `--color-coral` | `#ff5c7a` | Errores, alertas, acciones destructivas |

> **Regla de Combinación**: Los primarios (`--color-primary`, `--color-secondary`, `--color-accent`) nunca deben competir con los complementarios en el mismo componente. Usar complementarios **solo** para estados o acentos aislados.

### 2.3 Gradientes Predefinidos
```css
--gradient-primary: linear-gradient(135deg, #6c5dd3, #4e7fff);
--gradient-accent: linear-gradient(135deg, #9d7bff, #22d3ee);
--gradient-warm: linear-gradient(45deg, #f59e0b, #ffd700);
--gradient-glass: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
```

### 2.4 Fondos
| Token | Valor | Uso |
|---|---|---|
| `--bg-space` | `radial-gradient(circle at 30% 20%, #262a63 0%, #14142e 45%, #05050f 100%)` | Fondo base del universo (índigo-navy) |
| `--bg-fog` | `radial-gradient(circle, rgba(108, 93, 211, 0.25), transparent 70%)` | Overlay animado |
| `--bg-glass` | `rgba(255, 255, 255, 0.05)` | Paneles, cards |
| `--bg-glass-hover` | `rgba(255, 255, 255, 0.08)` | Botones secundarios hover |
| `--bg-input` | `#111` | Inputs, selects, textareas |
| `--bg-dark` | `#0a0a0f` | Fondos de secciones internas |
| `--bg-void` | `#000000` | Fondo puro |

### 2.5 Texto
| Token | Valor | Uso |
|---|---|---|
| `--text-primary` | `#ffffff` | Títulos, texto principal |
| `--text-secondary` | `rgba(255, 255, 255, 0.8)` | Subtítulos, labels |
| `--text-muted` | `rgba(255, 255, 255, 0.5)` | Placeholders, texto deshabilitado |
| `--text-gold` | `#ffd700` | Logros, puntos destacados |

### 2.6 Estados (Actualizados)
| Token | Hex | Uso |
|---|---|---|
| `--state-success` | `#10d97a` | Respuesta correcta, éxito |
| `--state-error` | `#ff5c7a` | Respuesta incorrecta, error |
| `--state-warning` | `#ffd700` | Advertencias, tiempo bajo |
| `--state-info` | `#22d3ee` | Información, hints |
| `--state-selected` | `#ffffff` | Borde de elemento seleccionado |

> **Regla**: Nunca hardcodear colores hex en nuevos componentes. Siempre usar los tokens del design system o extenderlos.

---

## 3. Variables CSS Globales (Simetría)

Todas las variables deben definirse en `:root` para mantener **consistencia forzada**:

```css
:root {
  /* Colores Primarios */
  --color-primary: #6c5dd3;
  --color-secondary: #4e7fff;
  --color-accent: #9d7bff;
  
  /* Colores Complementarios */
  --color-cyan: #22d3ee;
  --color-magenta: #ff00aa;
  --color-gold: #ffd700;
  --color-orange: #f59e0b;
  --color-mint: #10d97a;
  --color-coral: #ff5c7a;
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #6c5dd3, #4e7fff);
  --gradient-accent: linear-gradient(135deg, #9d7bff, #22d3ee);
  --gradient-warm: linear-gradient(45deg, #f59e0b, #ffd700);
  --gradient-glass: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  
  /* Fondos */
  --bg-space: radial-gradient(circle at 30% 20%, #262a63 0%, #14142e 45%, #05050f 100%);
  --bg-fog: radial-gradient(circle, rgba(108, 93, 211, 0.25), transparent 70%);
  --bg-glass: rgba(255, 255, 255, 0.05);
  --bg-glass-hover: rgba(255, 255, 255, 0.08);
  --bg-input: #14142b;
  --bg-dark: #0a0a0f;
  
  /* Texto */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-muted: rgba(255, 255, 255, 0.5);
  
  /* Estados */
  --state-success: #10d97a;
  --state-error: #ff5c7a;
  --state-warning: #ffd700;
  --state-info: #22d3ee;
  
  /* Glows y Sombras */
  --glow-primary: 0 0 20px var(--color-accent), 0 0 40px var(--color-secondary);
  --glow-intense: 0 0 30px var(--color-primary), 0 0 60px var(--color-secondary);
  --glow-cyan: 0 0 20px var(--color-cyan), 0 0 40px rgba(34, 211, 238, 0.5);
  --glow-gold: 0 0 20px #ffd700, 0 0 40px rgba(255, 215, 0, 0.5);
  --shadow-panel: 0 0 40px rgba(108, 93, 211, 0.35);
  
  /* Border Radius (Escala Simétrica) */
  --radius-sm: 12px;
  --radius-md: 15px;
  --radius-lg: 18px;
  --radius-xl: 20px;
  --radius-panel: 25px;
  --radius-full: 50%;
  
  /* Espaciado (Escala 4px base) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  --space-4xl: 40px;
  --space-5xl: 48px;
  
  /* Tipografía */
  --font-base: 'Arial', 'Helvetica', sans-serif;
  --text-xs: 14px;
  --text-sm: 16px;
  --text-md: 18px;
  --text-lg: 22px;
  --text-xl: 28px;
  --text-2xl: 45px;
  --text-3xl: 55px;
  --text-4xl: 65px;
  
  /* Transiciones */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

---

## 4. Tipografía

- **Familia base**: `var(--font-base)`
- **Títulos principales**: `var(--text-3xl)`–`var(--text-4xl)`, centered, `text-shadow: var(--glow-primary)`
- **Subtítulos**: `var(--text-lg)`, `opacity: 0.8`
- **Section titles**: `var(--text-xl)`
- **Botones**: `var(--text-md)`–`var(--text-xl)`
- **Inputs**: `var(--text-sm)`–`var(--text-xl)`
- **Info/resultados**: `var(--text-lg)`

---

## 5. Espaciado y Layout

### Escala Simétrica (Base 4px)
| Token | Valor | Uso |
|---|---|---|
| `--space-xs` | `4px` | Separación mínima |
| `--space-sm` | `8px` | Gap interno pequeño |
| `--space-md` | `12px` | Gap entre inputs, margin-top base |
| `--space-lg` | `16px` | Padding de cards, gap de botones |
| `--space-xl` | `20px` | Margin-top estándar |
| `--space-2xl` | `24px` | Margin-bottom de títulos |
| `--space-3xl` | `32px` | Padding de paneles |
| `--space-4xl` | `40px` | Separación de secciones |
| `--space-5xl` | `48px` | Padding grande de paneles |

### Border Radius Simétrico
| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | `12px` | Inputs, selects, badges |
| `--radius-md` | `15px` | Botones, cards |
| `--radius-lg` | `18px` | Botones CTA |
| `--radius-xl` | `20px` | Secciones internas |
| `--radius-panel` | `25px` | Paneles, logos |

### Layout Patterns
- **Centrado absoluto**: `position: absolute/ fixed`, `flex`, `justify-content: center`, `align-items: center`
- **Paneles**: `width: 700px–950px`, `max-width: 95%`, glassmorphism
- **Screens**: Pantallas completas apiladas, visibilidad controlada por clase `.active` / `.show`
- **Grupos de botones**: `display: flex`, `gap: var(--space-lg)`, `flex-wrap: wrap`, `justify-content: center`

---

## 6. Sistema de Componentes (Simétrico)

### 6.1 Convención de Nombres
Usar **BEM modificado** para mantener simetría:
- `.componente` → Bloque base
- `.componente--modificador` → Variante (tamaño, color, estado)
- `.componente__elemento` → Parte interna

### 6.2 Botones

#### Base: `.btn`
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg) var(--space-3xl);
  border: none;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  color: var(--text-primary);
  font-size: var(--text-md);
  font-family: var(--font-base);
  cursor: pointer;
  transition: var(--transition-base);
}
.btn:hover {
  transform: scale(1.05);
  box-shadow: var(--glow-primary);
}
```

#### Modificadores de Tamaño
| Clase | Cambio | Uso |
|---|---|---|
| `.btn--sm` | `padding: var(--space-md) var(--space-xl); font-size: var(--text-sm);` | Acciones secundarias |
| `.btn--lg` | `padding: var(--space-xl) var(--space-4xl); font-size: var(--text-xl); border-radius: var(--radius-lg);` | CTA principal |
| `.btn--xl` | `padding: var(--space-2xl) var(--space-5xl); font-size: var(--text-2xl); border-radius: var(--radius-lg);` | Portada, inicio |

#### Modificadores de Color/Estilo
| Clase | Cambio | Uso |
|---|---|---|
| `.btn--secondary` | `background: var(--bg-glass);` | Botones de navegación, volver |
| `.btn--secondary:hover` | `background: var(--gradient-primary);` | Hover con gradiente |
| `.btn--outline` | `background: transparent; border: 2px solid var(--color-accent);` | Acciones terciarias |
| `.btn--gold` | `background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000;` | Logros, recompensas |
| `.btn--success` | `background: var(--state-success); color: #000;` | Confirmar, correcto |
| `.btn--danger` | `background: var(--state-error);` | Eliminar, salir |

> **Simetría Obligatoria**: Todos los botones deben usar `display: inline-flex`, `align-items: center`, `justify-content: center` para que el texto siempre esté centrado vertical y horizontalmente.

### 6.3 Paneles

#### Base: `.panel`
```css
.panel {
  width: 100%;
  max-width: 950px;
  padding: var(--space-3xl);
  border-radius: var(--radius-panel);
  background: var(--bg-glass);
  backdrop-filter: blur(15px);
  box-shadow: var(--shadow-panel);
  text-align: center;
}
```

#### Modificadores
| Clase | Cambio | Uso |
|---|---|---|
| `.panel--sm` | `max-width: 700px; padding: var(--space-2xl);` | Paneles compactos |
| `.panel--lg` | `max-width: 1200px; padding: var(--space-4xl);` | Dashboards |
| `.panel--glass` | `background: var(--gradient-glass); border: 1px solid rgba(255,255,255,0.1);` | Variante cristal |

### 6.4 Inputs

#### Base: `.input`
```css
.input {
  width: 100%;
  padding: var(--space-lg);
  margin-top: var(--space-md);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: var(--text-md);
  font-family: var(--font-base);
  transition: var(--transition-base);
}
.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-accent), var(--glow-primary);
}
```

#### Modificadores
| Clase | Cambio | Uso |
|---|---|---|
| `.input--center` | `text-align: center;` | Inputs numéricos, respuestas |
| `.input--lg` | `font-size: var(--text-xl); padding: var(--space-xl);` | Respuestas del juego |
| `.input--inline` | `width: auto; display: inline-block;` | Inputs en línea |

### 6.5 Cards

#### Base: `.card`
```css
.card {
  margin-top: var(--space-lg);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.06);
  transition: var(--transition-base);
}
.card:hover {
  transform: scale(1.02);
  background: rgba(255, 255, 255, 0.08);
}
```

#### Modificadores
| Clase | Cambio | Uso |
|---|---|---|
| `.card--success` | `border-left: 4px solid var(--state-success);` | Respuesta correcta |
| `.card--error` | `border-left: 4px solid var(--state-error);` | Respuesta incorrecta |
| `.card--gold` | `border: 1px solid var(--color-gold); box-shadow: var(--glow-gold);` | Logros |

### 6.6 Logo

#### Base: `.logo`
```css
.logo {
  width: 240px;
  border-radius: var(--radius-panel);
  box-shadow: var(--glow-intense);
  animation: float 3s infinite ease-in-out;
}
```

#### Modificadores
| Clase | Cambio | Uso |
|---|---|---|
| `.logo--sm` | `width: 120px;` | Header, navbar |
| `.logo--lg` | `width: 320px;` | Pantalla de carga |

---

## 7. Animaciones

### Keyframes Estándar
| Nombre | Duración | Uso |
|---|---|---|
| `fade` | `0.5s–0.7s` | Transición entre pantallas (`opacity` + `translateY`) |
| `float` | `3s infinite` | Logo flotando |
| `fogMove` | `8s infinite alternate` | Overlay de neblina espacial |
| `twinkle` | `2s–3s infinite alternate` | Estrellas parpadeantes |
| `pulse-glow` | `2s infinite` | Botones CTA, elementos importantes |

### Nuevas Animaciones
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: var(--glow-primary); }
  50% { box-shadow: 0 0 40px #8b5cf6, 0 0 80px #3b82f6; }
}
```

### Reglas de Animación
- **Entrada de pantallas**: Usar `animation: fade 0.7s` en `.screen.active`
- **Elementos interactivos**: `transition: var(--transition-base)` en botones y cards
- **Hover de botones**: `transform: scale(1.05)`
- **CTA importantes**: `animation: pulse-glow 2s infinite` para destacar
- **Nunca** bloquear la UI con animaciones largas sin `setTimeout` de respaldo

---

## 8. Arquitectura CSS / Patrones

### Estructura de pantallas
Cada vista es un `.screen` con visibilidad controlada por JS:
```html
<div class="screen active" id="home">...</div>
<div class="screen" id="portal">...</div>
```
```css
.screen {
  position: absolute;
  width: 100%;
  height: 100%;
  display: none;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.screen.active {
  display: flex;
}
```

### Secciones dentro de paneles
```html
<div class="section show" id="studentsSection">...</div>
```
```css
.section {
  display: none;
  /* ... glass styling ... */
}
.section.show {
  display: block;
}
```

### Background obligatorio
Toda página DEBE incluir:
```html
<div class="space"></div>
<div class="fog"></div>
```

---

## 9. Reglas de Uso para Desarrolladores / Agentes

1. **Nunca usar fondos claros**. El tema es dark-only.
2. **Nunca hardcodear colores o valores**. Siempre usar las variables CSS (`var(--...)`).
3. **Nunca usar `<button>` sin clase `.btn`**. Siempre aplicar `.btn` + modificadores.
4. **Siempre envolver inputs en `.panel` o estructura glassmorphism** cuando están en formularios.
5. **Siempre usar `border-radius` consistente** según la escala (`--radius-sm` a `--radius-panel`).
6. **Siempre agregar `transition: var(--transition-base)`** a elementos interactivos nuevos.
7. **Siempre usar `box-shadow` con glow** en paneles y logos (`var(--glow-primary)` o `var(--glow-intense)`).
8. **Nunca romper el patrón de pantallas `.screen`**. Si se agrega una nueva vista, seguir el modelo `.screen` + `.active`.
9. **Nunca usar `alert()` nativo para UX moderna**. Reemplazar por modales o feedback inline dentro del glass panel.
10. **Mantener responsive**: `max-width: 95%` en paneles, `flex-wrap: wrap` en grupos de botones.
11. **Todos los botones deben usar `display: inline-flex`** para centrado simétrico del texto.
12. **Todos los paneles deben tener la misma estructura**: `width: 100%`, `max-width`, `padding`, `border-radius`, `background`, `backdrop-filter`, `box-shadow`.
13. **Mantener jerarquía de espaciado**: Nunca inventar valores de padding/margin que no estén en la escala `--space-xs` a `--space-5xl`.
14. **Gradientes siempre en ángulo 45deg o 135deg** para mantener consistencia visual.
15. **Glows siempre dobles**: nunca una sola sombra, siempre al menos dos capas (cerca + lejos).

---

## 10. Inventario de Clases CSS (Snapshot Actual)

### Layout & Estructura
`.space`, `.fog`, `.cover`, `.intro`, `.menu`, `.screen`, `.panel`, `.section`, `.menu-buttons`, `.options`, `.game`, `.menu-screen`

### Componentes Base
`.logo`, `.main-title`, `.subtitle`, `.btn`, `.input`, `.card`, `.info`, `.result`, `.question`, `.section-title`

### Modificadores (Nuevos)
`.btn--sm`, `.btn--lg`, `.btn--xl`, `.btn--secondary`, `.btn--outline`, `.btn--gold`, `.btn--success`, `.btn--danger`, `.panel--sm`, `.panel--lg`, `.panel--glass`, `.input--center`, `.input--lg`, `.input--inline`, `.card--success`, `.card--error`, `.card--gold`, `.logo--sm`, `.logo--lg`

### Estados
`.active`, `.show`, `.selected`

### Efectos & Animaciones
`.star`, `.portal`, `.ring`, `.crack`

---

*Última actualización: v2.0 — Expansión de paleta + Sistema de variables CSS simétrico.*
