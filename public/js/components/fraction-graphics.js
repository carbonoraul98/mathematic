/**
 * FractionGraphics - Generador dinámico de modelos visuales para fracciones en SVG.
 * Soporta:
 * 1. Modelos circulares (tortas) de fracciones equivalentes.
 * 2. Rectas numéricas paralelas de comparación (ej: cuartos vs octavos).
 * 3. Recta numérica individual graduada (ej: doceavos).
 */

(function(window) {
  'use strict';

  const FractionGraphics = {
    // Genera el path SVG para un sector circular (torta)
    getSlicePath(cx, cy, r, startAngle, endAngle) {
      const x1 = cx + r * Math.sin(startAngle);
      const y1 = cy - r * Math.cos(startAngle);
      const x2 = cx + r * Math.sin(endAngle);
      const y2 = cy - r * Math.cos(endAngle);
      const diff = endAngle - startAngle;
      const largeArc = diff > Math.PI ? 1 : 0;
      return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    },

    // Renderiza un círculo fraccionario individual
    renderSinglePie(cx, cy, r, denominator, numerator, fillColor) {
      if (denominator <= 0) denominator = 1;
      let svg = `<g class="fraction-pie" transform="translate(0, 0)">`;

      if (denominator === 1) {
        const fill = numerator >= 1 ? fillColor : '#FFFFFF';
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#1E293B" stroke-width="2.5" />`;
      } else {
        const step = (2 * Math.PI) / denominator;
        for (let i = 0; i < denominator; i++) {
          const sAngle = i * step;
          const eAngle = (i + 1) * step;
          const isFilled = i < numerator;
          const fill = isFilled ? fillColor : '#FFFFFF';
          const path = this.getSlicePath(cx, cy, r, sAngle, eAngle);
          svg += `<path d="${path}" fill="${fill}" stroke="#1E293B" stroke-width="2.2" stroke-linejoin="round" />`;
        }
      }
      svg += `</g>`;
      return svg;
    },

    // Renderiza dos modelos circulares con fórmula matemática debajo (Imagen 1)
    renderPies(config) {
      // config: { left: { d: 2, n: 1, color: '#F59E0B' }, right: { d: 6, n: 3, color: '#3B82F6' }, formula: '1/2 = ?/6' }
      const width = 480;
      const height = 240;
      const r = 62;
      const c1x = 135;
      const c2x = 345;
      const cy = 82;

      let formulaHtml = '';
      if (config.formula) {
        // Parsear fórmula tipo "1/2 = ?/6" o "1/2 = 3/6"
        const parts = config.formula.split('=').map(s => s.trim());
        const leftF = parts[0] ? parts[0].split('/') : ['1', '2'];
        const rightF = parts[1] ? parts[1].split('/') : ['?', '6'];
        const isRightQuestion = rightF[0].includes('?');

        formulaHtml = `
          <g transform="translate(240, 195)" text-anchor="middle" font-family="'Inter', sans-serif">
            <!-- Fracción izquierda -->
            <text x="-65" y="-6" font-size="19" font-weight="700" fill="#0F172A">${leftF[0]}</text>
            <line x1="-78" y1="0" x2="-52" y2="0" stroke="#0F172A" stroke-width="2.5" />
            <text x="-65" y="19" font-size="19" font-weight="700" fill="#0F172A">${leftF[1] || '1'}</text>

            <!-- Signo igual -->
            <text x="-25" y="6" font-size="22" font-weight="700" fill="#0F172A">=</text>

            <!-- Fracción derecha -->
            ${isRightQuestion ? `
              <rect x="5" y="-22" width="30" height="26" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="2" />
              <text x="20" y="-4" font-size="18" font-weight="700" fill="#0284C7">?</text>
            ` : `
              <text x="20" y="-6" font-size="19" font-weight="700" fill="#0F172A">${rightF[0]}</text>
            `}
            <line x1="5" y1="0" x2="35" y2="0" stroke="#0F172A" stroke-width="2.5" />
            <text x="20" y="19" font-size="19" font-weight="700" fill="#0F172A">${rightF[1] || '1'}</text>
          </g>
        `;
      }

      const pie1 = this.renderSinglePie(c1x, cy, r, config.left.d, config.left.n, config.left.color || '#F59E0B');
      const pie2 = this.renderSinglePie(c2x, cy, r, config.right.d, config.right.n, config.right.color || '#3B82F6');

      return `
        <div class="fraction-graphic-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; margin: 12px auto; max-width: 520px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
            ${pie1}
            ${pie2}
            ${formulaHtml}
          </svg>
        </div>
      `;
    },

    // Renderiza dos rectas numéricas paralelas para comparar equivalencia (Imagen 2)
    renderComparisonNumberLines(config) {
      // config: { line1: { d: 4, point: 1, color: '#10B981' }, line2: { d: 8, point: 1, color: '#D946EF' } }
      const width = 640;
      const height = 180;
      const xStart = 65;
      const xEnd = 575;
      const length = xEnd - xStart;

      function renderLine(y, d, point, color) {
        let svg = `
          <!-- Recta con flechas en los extremos -->
          <line x1="${xStart - 25}" y1="${y}" x2="${xEnd + 25}" y2="${y}" stroke="#64748B" stroke-width="2.5" />
          <!-- Flecha izquierda -->
          <polygon points="${xStart - 25},${y} ${xStart - 15},${y - 5} ${xStart - 15},${y + 5}" fill="#64748B" />
          <!-- Flecha derecha -->
          <polygon points="${xEnd + 25},${y} ${xEnd + 15},${y - 5} ${xEnd + 15},${y + 5}" fill="#64748B" />
        `;

        for (let i = 0; i <= d; i++) {
          const x = xStart + (i / d) * length;
          // Ticks verticales
          svg += `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="#64748B" stroke-width="2.5" />`;

          // Etiquetas
          if (i === 0) {
            svg += `<text x="${x}" y="${y + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">0</text>`;
          } else if (i === d) {
            svg += `<text x="${x}" y="${y + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">1</text>`;
          } else {
            // Fracción con barra horizontal
            svg += `
              <g transform="translate(${x}, ${y + 22})" text-anchor="middle" font-family="'Inter', sans-serif">
                <text x="0" y="-3" font-size="12" font-weight="700" fill="#0F172A">${i}</text>
                <line x1="-7" y1="2" x2="7" y2="2" stroke="#0F172A" stroke-width="1.8" />
                <text x="0" y="14" font-size="12" font-weight="700" fill="#0F172A">${d}</text>
              </g>
            `;
          }
        }

        // Punto marcado
        if (point !== null && point !== undefined) {
          const px = xStart + (point / d) * length;
          svg += `
            <circle cx="${px}" cy="${y}" r="8.5" fill="${color || '#10B981'}" stroke="#FFFFFF" stroke-width="2.5">
              <animate attributeName="r" values="8.5;10;8.5" dur="2s" repeatCount="indefinite" />
            </circle>
          `;
        }

        return svg;
      }

      const svgLine1 = renderLine(45, config.line1.d, config.line1.point, config.line1.color || '#10B981');
      const svgLine2 = renderLine(125, config.line2.d, config.line2.point, config.line2.color || '#D946EF');

      return `
        <div class="fraction-graphic-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; margin: 12px auto; max-width: 580px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
            ${svgLine1}
            ${svgLine2}
          </svg>
        </div>
      `;
    },

    // Renderiza una recta numérica individual graduada (Imagen 3)
    renderSingleNumberLine(config) {
      // config: { d: 12, highlight: 3, color: '#3B82F6' }
      const width = 640;
      const height = 110;
      const xStart = 65;
      const xEnd = 575;
      const length = xEnd - xStart;
      const d = config.d || 12;
      const y = 45;

      let svg = `
        <line x1="${xStart - 25}" y1="${y}" x2="${xEnd + 25}" y2="${y}" stroke="#64748B" stroke-width="2.5" />
        <polygon points="${xStart - 25},${y} ${xStart - 15},${y - 5} ${xStart - 15},${y + 5}" fill="#64748B" />
        <polygon points="${xEnd + 25},${y} ${xEnd + 15},${y - 5} ${xEnd + 15},${y + 5}" fill="#64748B" />
      `;

      for (let i = 0; i <= d; i++) {
        const x = xStart + (i / d) * length;
        svg += `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="#64748B" stroke-width="2.2" />`;

        if (i === 0) {
          svg += `<text x="${x}" y="${y + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">0</text>`;
        } else if (i === d) {
          svg += `<text x="${x}" y="${y + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">1</text>`;
        } else {
          svg += `
            <g transform="translate(${x}, ${y + 20})" text-anchor="middle" font-family="'Inter', sans-serif">
              <text x="0" y="-3" font-size="11" font-weight="700" fill="#0F172A">${i}</text>
              <line x1="-6" y1="2" x2="6" y2="2" stroke="#0F172A" stroke-width="1.6" />
              <text x="0" y="14" font-size="11" font-weight="700" fill="#0F172A">${d}</text>
            </g>
          `;
        }
      }

      if (config.highlight !== null && config.highlight !== undefined) {
        const px = xStart + (config.highlight / d) * length;
        svg += `
          <circle cx="${px}" cy="${y}" r="8.5" fill="${config.color || '#3B82F6'}" stroke="#FFFFFF" stroke-width="2.5">
            <animate attributeName="r" values="8.5;10;8.5" dur="2s" repeatCount="indefinite" />
          </circle>
        `;
      }

      return `
        <div class="fraction-graphic-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; margin: 12px auto; max-width: 580px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
            ${svg}
          </svg>
        </div>
      `;
    },

    // Renderiza multiplicación vertical en columna con caja de respuesta
    renderVerticalMult(config) {
      const width = 280;
      const height = 230;
      const topStr = String(config.top);
      const bottomStr = String(config.bottom);
      return `
        <div class="math-vertical-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 14px 20px; margin: 12px auto; max-width: 300px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); text-align: center;">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 220px; height: auto; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
            <!-- Primer número -->
            <text x="210" y="55" text-anchor="end" font-family="'Courier New', Courier, monospace" font-size="44" font-weight="700" fill="#0F172A" letter-spacing="4">${topStr}</text>
            
            <!-- Signo de multiplicación -->
            <text x="60" y="115" text-anchor="start" font-family="'Inter', sans-serif" font-size="38" font-weight="700" fill="#0F172A">×</text>
            
            <!-- Segundo número -->
            <text x="210" y="115" text-anchor="end" font-family="'Courier New', Courier, monospace" font-size="44" font-weight="700" fill="#0F172A" letter-spacing="4">${bottomStr}</text>
            
            <!-- Línea separadora -->
            <line x1="50" y1="135" x2="225" y2="135" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" />
            
            <!-- Caja de respuesta -->
            <rect x="50" y="150" width="175" height="58" rx="8" fill="#F0F9FF" stroke="#0284C7" stroke-width="2.5" />
          </svg>
        </div>
      `;
    },

    // Renderiza división en formato de galera
    renderVerticalDiv(config) {
      const width = 320;
      const height = 180;
      const divStr = String(config.dividend);
      const dvrStr = String(config.divisor);
      return `
        <div class="math-vertical-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 14px 20px; margin: 12px auto; max-width: 320px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); text-align: center;">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 250px; height: auto; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
            <!-- Dividendo -->
            <text x="140" y="70" text-anchor="end" font-family="'Courier New', Courier, monospace" font-size="38" font-weight="700" fill="#0F172A" letter-spacing="2">${divStr}</text>
            
            <!-- Líneas de la galera -->
            <line x1="152" y1="25" x2="152" y2="85" stroke="#0F172A" stroke-width="3" />
            <line x1="152" y1="85" x2="265" y2="85" stroke="#0F172A" stroke-width="3" />
            
            <!-- Divisor -->
            <text x="170" y="70" text-anchor="start" font-family="'Courier New', Courier, monospace" font-size="38" font-weight="700" fill="#0F172A" letter-spacing="2">${dvrStr}</text>
            
            <!-- Caja de cociente bajo la galera -->
            <rect x="165" y="100" width="100" height="50" rx="6" fill="#F0F9FF" stroke="#0284C7" stroke-width="2" />
            <text x="215" y="132" text-anchor="middle" font-family="'Inter', sans-serif" font-size="20" font-weight="700" fill="#0284C7">?</text>
          </svg>
        </div>
      `;
    },

    // Dibuja una forma geométrica en el plano cartesiano
    renderShape(type, x, y, color) {
      if (type === 'heart') {
        return `<path d="M 0 5 C -2.5 -6 -14 -6 -14 2.5 C -14 9.5 0 17 0 17 C 0 17 14 9.5 14 2.5 C 14 -6 2.5 -6 0 5 Z" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" transform="translate(${x}, ${y - 6}) scale(1.15)"/>`;
      } else if (type === 'circle') {
        return `<circle cx="${x}" cy="${y}" r="12" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>`;
      } else if (type === 'star') {
        return `<polygon points="0,-14 4.2,-4.2 14.5,-4.2 6.5,2.5 9.5,13 0,6.8 -9.5,13 -6.5,2.5 -14.5,-4.2 -4.2,-4.2" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" transform="translate(${x}, ${y}) scale(1.1)"/>`;
      } else if (type === 'pentagon') {
        return `<polygon points="0,-14 13.3,-4.3 8.2,11.3 -8.2,11.3 -13.3,-4.3" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" transform="translate(${x}, ${y}) scale(1.1)"/>`;
      } else if (type === 'triangle') {
        return `<polygon points="0,-14 13,10 -13,10" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" transform="translate(${x}, ${y})"/>`;
      } else if (type === 'diamond') {
        return `<polygon points="0,-14 13,0 0,14 -13,0" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" transform="translate(${x}, ${y})"/>`;
      }
      return `<circle cx="${x}" cy="${y}" r="8" fill="${color}" />`;
    },

    // Renderiza el plano cartesiano con cuadrícula y figuras geométricas
    renderCoordinatePlane(config) {
      const width = 450;
      const height = 450;
      const x0 = 55;
      const y0 = 390;
      const step = 33; // 10 unidades * 33 = 330px
      const maxVal = config.max || 10;

      let svg = `
        <div class="math-plane-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; margin: 12px auto; max-width: 480px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
      `;

      // Cuadrícula gris
      for (let i = 0; i <= maxVal; i++) {
        const x = x0 + i * step;
        const y = y0 - i * step;

        // Línea vertical
        svg += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 - maxVal * step}" stroke="#CBD5E1" stroke-width="1.2" />`;
        // Línea horizontal
        svg += `<line x1="${x0}" y1="${y}" x2="${x0 + maxVal * step}" y2="${y}" stroke="#CBD5E1" stroke-width="1.2" />`;

        // Etiquetas Eje X
        svg += `<text x="${x}" y="${y0 + 20}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" font-weight="600" fill="#475569">${i}</text>`;

        // Etiquetas Eje Y (no repetir 0)
        if (i > 0) {
          svg += `<text x="${x0 - 14}" y="${y + 5}" text-anchor="end" font-family="'Inter', sans-serif" font-size="13" font-weight="600" fill="#475569">${i}</text>`;
        }
      }

      // Ejes principales con flechas
      // Eje X
      svg += `
        <line x1="${x0}" y1="${y0}" x2="${x0 + maxVal * step + 22}" y2="${y0}" stroke="#475569" stroke-width="2.5" />
        <polygon points="${x0 + maxVal * step + 22},${y0} ${x0 + maxVal * step + 12},${y0 - 5} ${x0 + maxVal * step + 12},${y0 + 5}" fill="#475569" />
        <text x="${x0 + maxVal * step + 18}" y="${y0 - 8}" font-family="'Inter', sans-serif" font-size="14" font-style="italic" font-weight="700" fill="#0F172A">x</text>
      `;

      // Eje Y
      svg += `
        <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - maxVal * step - 22}" stroke="#475569" stroke-width="2.5" />
        <polygon points="${x0},${y0 - maxVal * step - 22} ${x0 - 5},${y0 - maxVal * step - 12} ${x0 + 5},${y0 - maxVal * step - 12}" fill="#475569" />
        <text x="${x0 + 10}" y="${y0 - maxVal * step - 16}" font-family="'Inter', sans-serif" font-size="14" font-style="italic" font-weight="700" fill="#0F172A">y</text>
      `;

      // Dibujar puntos / figuras geométricas
      if (Array.isArray(config.points)) {
        config.points.forEach(pt => {
          const px = x0 + pt.x * step;
          const py = y0 - pt.y * step;
          svg += this.renderShape(pt.shape, px, py, pt.color || '#3B82F6');
        });
      }

      svg += `
          </svg>
        </div>
      `;
      return svg;
    },

    // Renderiza gráfico de barras estadístico
    renderBarChart(config) {
      const width = 480;
      const height = 270;
      const x0 = 55;
      const y0 = 215;
      const chartWidth = 385;
      const chartHeight = 160;
      const items = config.items || [];
      const title = config.title || 'Gráfico de Barras';

      const maxRaw = Math.max(...items.map(it => it.val || 0), 10);
      const stepVal = maxRaw <= 15 ? 5 : (maxRaw <= 30 ? 10 : 20);
      const maxVal = Math.ceil(maxRaw / stepVal) * stepVal;

      let svg = `
        <div class="math-chart-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; margin: 12px auto; max-width: 520px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
            <!-- Título del gráfico -->
            <text x="240" y="28" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#0F172A">${title}</text>
      `;

      // Líneas de cuadrícula horizontal y etiquetas de eje Y
      const gridSteps = maxVal / stepVal;
      for (let i = 0; i <= gridSteps; i++) {
        const val = i * stepVal;
        const gy = y0 - (val / maxVal) * chartHeight;
        svg += `
          <line x1="${x0}" y1="${gy}" x2="${x0 + chartWidth}" y2="${gy}" stroke="#E2E8F0" stroke-width="1.2" stroke-dasharray="${i === 0 ? 'none' : '3,3'}" />
          <text x="${x0 - 12}" y="${gy + 4}" text-anchor="end" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#64748B">${val}</text>
        `;
      }

      // Eje X e Y base
      svg += `
        <line x1="${x0}" y1="${y0}" x2="${x0 + chartWidth + 10}" y2="${y0}" stroke="#475569" stroke-width="2" />
        <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - chartHeight - 10}" stroke="#475569" stroke-width="2" />
      `;

      // Barras y categorías
      if (items.length > 0) {
        const slotWidth = chartWidth / items.length;
        const barWidth = Math.min(slotWidth * 0.58, 48);

        items.forEach((item, idx) => {
          const bx = x0 + idx * slotWidth + (slotWidth - barWidth) / 2;
          const bHeight = (item.val / maxVal) * chartHeight;
          const by = y0 - bHeight;
          const color = item.color || '#3B82F6';

          svg += `
            <!-- Barra con sombra ligera -->
            <rect x="${bx}" y="${by}" width="${barWidth}" height="${bHeight}" rx="5" fill="${color}">
              <animate attributeName="height" from="0" to="${bHeight}" dur="0.6s" fill="freeze" />
              <animate attributeName="y" from="${y0}" to="${by}" dur="0.6s" fill="freeze" />
            </rect>
            <!-- Valor numérico arriba -->
            <text x="${bx + barWidth / 2}" y="${by - 7}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#0F172A">${item.val}</text>
            <!-- Etiqueta de categoría abajo -->
            <text x="${bx + barWidth / 2}" y="${y0 + 20}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#334155">${item.label}</text>
          `;
        });
      }

      svg += `
          </svg>
        </div>
      `;
      return svg;
    },

    // Renderiza tarjeta visual para expresiones algebraicas
    renderAlgebraCard(config) {
      const expr = config.expression || 'x + 5';
      const note = config.note || '';
      return `
        <div class="math-algebra-card" style="background: linear-gradient(135deg, #0F172A, #1E293B); border: 1px solid #334155; border-radius: 16px; padding: 18px 24px; margin: 12px auto; max-width: 380px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); text-align: center;">
          <div style="font-size: 0.85rem; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Expresión Algebraica</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 2.2rem; font-weight: 700; color: #38BDF8; letter-spacing: 2px; margin: 10px 0;">
            ${expr}
          </div>
          ${note ? `<div style="font-size: 0.95rem; font-weight: 600; color: #FBBF24; background: rgba(251, 191, 36, 0.12); padding: 4px 12px; border-radius: 20px; display: inline-block;">${note}</div>` : ''}
        </div>
      `;
    },

    // Parsea texto de pregunta para detectar si contiene tag de gráfico
    parseQuestion(rawText) {
      if (!rawText) return { cleanText: '', graphicHtml: '' };

      const tagMatch = rawText.match(/\[grafico:(pies|dual_lines|single_line|vertical_mult|vertical_div|plane|bar_chart|algebra):([^\]]+)\]/i);
      if (!tagMatch) {
        return { cleanText: rawText, graphicHtml: '' };
      }

      const fullTag = tagMatch[0];
      const type = tagMatch[1].toLowerCase();
      const payload = tagMatch[2];
      const cleanText = rawText.replace(fullTag, '').trim();

      try {
        if (type === 'pies') {
          const [piesPart, formulaPart] = payload.split(':');
          const [p1, p2] = piesPart.split('|');
          const [d1, n1, c1] = p1.split(',');
          const [d2, n2, c2] = p2.split(',');

          const html = this.renderPies({
            left: { d: parseInt(d1), n: parseInt(n1), color: c1 || '#F59E0B' },
            right: { d: parseInt(d2), n: parseInt(n2), color: c2 || '#3B82F6' },
            formula: formulaPart || ''
          });
          return { cleanText, graphicHtml: html };
        } else if (type === 'dual_lines') {
          const [l1, l2] = payload.split('|');
          const [d1, pt1, c1] = l1.split(',');
          const [d2, pt2, c2] = l2.split(',');

          const html = this.renderComparisonNumberLines({
            line1: { d: parseInt(d1), point: pt1 !== 'null' ? parseFloat(pt1) : null, color: c1 || '#10B981' },
            line2: { d: parseInt(d2), point: pt2 !== 'null' ? parseFloat(pt2) : null, color: c2 || '#D946EF' }
          });
          return { cleanText, graphicHtml: html };
        } else if (type === 'single_line') {
          const [dPart, ptPart, colorPart] = payload.split(':');
          const html = this.renderSingleNumberLine({
            d: parseInt(dPart) || 12,
            highlight: ptPart ? parseFloat(ptPart) : null,
            color: colorPart || '#3B82F6'
          });
          return { cleanText, graphicHtml: html };
        } else if (type === 'vertical_mult') {
          const [top, bottom] = payload.split(':');
          const html = this.renderVerticalMult({ top, bottom });
          return { cleanText, graphicHtml: html };
        } else if (type === 'vertical_div') {
          const [dividend, divisor] = payload.split(':');
          const html = this.renderVerticalDiv({ dividend, divisor });
          return { cleanText, graphicHtml: html };
        } else if (type === 'plane') {
          const pointsRaw = payload.split('|');
          const points = pointsRaw.map(p => {
            const [shape, x, y, color] = p.split(',');
            return { shape: shape.trim(), x: parseFloat(x), y: parseFloat(y), color: color ? color.trim() : '#3B82F6' };
          });
          const html = this.renderCoordinatePlane({ points, max: 10 });
          return { cleanText, graphicHtml: html };
        } else if (type === 'bar_chart') {
          // payload: "Fútbol,25,#3B82F6|Básquet,15,#F59E0B|Natación,20,#10B981:Deportes Favoritos"
          const [itemsPart, titlePart] = payload.split(':');
          const rawItems = itemsPart.split('|');
          const items = rawItems.map(it => {
            const [label, val, color] = it.split(',');
            return { label: label.trim(), val: parseFloat(val), color: color ? color.trim() : '#3B82F6' };
          });
          const html = this.renderBarChart({ title: titlePart || 'Gráfico de Barras', items });
          return { cleanText, graphicHtml: html };
        } else if (type === 'algebra') {
          // payload: "3x + 5:x = 4"
          const [expr, note] = payload.split(':');
          const html = this.renderAlgebraCard({ expression: expr, note });
          return { cleanText, graphicHtml: html };
        }
      } catch (err) {
        console.error('Error parseando gráfico matemático:', err);
      }

      return { cleanText, graphicHtml: '' };
    }
  };

  window.FractionGraphics = FractionGraphics;
  window.MathGraphics = FractionGraphics; // Alias
})(window);
