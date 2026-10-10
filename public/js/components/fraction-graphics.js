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

    // Parsea texto de pregunta para detectar si contiene tag de gráfico
    parseQuestion(rawText) {
      if (!rawText) return { cleanText: '', graphicHtml: '' };

      const tagMatch = rawText.match(/\[grafico:(pies|dual_lines|single_line):([^\]]+)\]/i);
      if (!tagMatch) {
        return { cleanText: rawText, graphicHtml: '' };
      }

      const fullTag = tagMatch[0];
      const type = tagMatch[1].toLowerCase();
      const payload = tagMatch[2];
      const cleanText = rawText.replace(fullTag, '').trim();

      try {
        if (type === 'pies') {
          // payload: "2,1,#F59E0B|6,3,#3B82F6:1/2 = ?/6"
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
          // payload: "4,1,#10B981|8,1,#D946EF"
          const [l1, l2] = payload.split('|');
          const [d1, pt1, c1] = l1.split(',');
          const [d2, pt2, c2] = l2.split(',');

          const html = this.renderComparisonNumberLines({
            line1: { d: parseInt(d1), point: pt1 !== 'null' ? parseFloat(pt1) : null, color: c1 || '#10B981' },
            line2: { d: parseInt(d2), point: pt2 !== 'null' ? parseFloat(pt2) : null, color: c2 || '#D946EF' }
          });
          return { cleanText, graphicHtml: html };
        } else if (type === 'single_line') {
          // payload: "12" o "12:3:#3B82F6"
          const [dPart, ptPart, colorPart] = payload.split(':');
          const html = this.renderSingleNumberLine({
            d: parseInt(dPart) || 12,
            highlight: ptPart ? parseFloat(ptPart) : null,
            color: colorPart || '#3B82F6'
          });
          return { cleanText, graphicHtml: html };
        }
      } catch (err) {
        console.error('Error parseando gráfico de fracciones:', err);
      }

      return { cleanText, graphicHtml: '' };
    }
  };

  window.FractionGraphics = FractionGraphics;
})(window);
