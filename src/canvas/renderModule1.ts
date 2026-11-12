import { EnergySnapshot, SimulationParams } from '../types/physics';
import { TranslationDict } from '../i18n/translations';

export interface Module1HitGeometry {
  blockX: number;
  blockY: number;
  blockW: number;
  blockH: number;
  eqX: number;
  pxPerMeter: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): string {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clamped);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clamped);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export function renderModule1(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: SimulationParams,
  snap: EnergySnapshot,
  tDict: TranslationDict,
  isDragging: boolean,
  animTime: number
): Module1HitGeometry {
  ctx.clearRect(0, 0, width, height);

  // Subtle scientific blueprint background
  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, width, height);

  // Fine grid lines
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
  ctx.lineWidth = 1;
  const gridStep = 28;
  for (let gx = gridStep; gx < width; gx += gridStep) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = gridStep; gy < height; gy += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  // Divider between Top Oscillator & Bottom Tanks
  const splitY = Math.round(height * 0.46);
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, splitY);
  ctx.lineTo(width - 20, splitY);
  ctx.stroke();

  // ================= TOP HALF: SPRING-MASS OSCILLATOR =================
  const wallX = 48;
  const rightMargin = 48;
  const eqX = wallX + (width - wallX - rightMargin) * 0.56;
  const maxSwingPx = Math.min(eqX - wallX - 78, width - rightMargin - eqX - 42);
  const pxPerMeter = maxSwingPx / Math.max(0.2, params.A);

  const trackY = Math.round(splitY * 0.66);
  const blockSizeScale = 0.85 + 0.35 * Math.sqrt((params.m - 0.5) / 9.5);
  const blockW = Math.round(54 * blockSizeScale);
  const blockH = Math.round(46 * blockSizeScale);
  const blockCenterX = eqX + snap.x * pxPerMeter;
  const blockX = blockCenterX - blockW / 2;
  const blockY = trackY - blockH;

  // Reference vertical lines (-A, -A/sqrt2, 0, +A/sqrt2, +A)
  const markers = [
    { val: -params.A, label: '-A', major: true, color: '#0284c7' },
    { val: -params.A * Math.SQRT1_2, label: '-A/√2', major: false, color: '#94a3b8' },
    { val: 0, label: '0', major: true, color: '#0f172a' },
    { val: params.A * Math.SQRT1_2, label: '+A/√2', major: false, color: '#94a3b8' },
    { val: params.A, label: '+A', major: true, color: '#0284c7' },
  ];

  const topGuideY = 26;
  markers.forEach((mk) => {
    const mx = eqX + mk.val * pxPerMeter;
    ctx.save();
    ctx.strokeStyle = mk.major ? 'rgba(2, 132, 199, 0.32)' : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = mk.major ? 1.5 : 1;
    ctx.setLineDash(mk.val === 0 ? [5, 4] : [3, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, topGuideY + 14);
    ctx.lineTo(mx, trackY + 16);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = mk.color;
    ctx.font = mk.major
      ? '700 11px "IBM Plex Mono", monospace'
      : '600 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(mk.label, mx, topGuideY + 8);
  });

  // Equilibrium label
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 11px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tDict.canvas.equilibrium, eqX, trackY + 34);

  // Frictionless track rail
  ctx.fillStyle = '#e0f2fe';
  drawRoundedRect(ctx, wallX, trackY, width - wallX - rightMargin + 20, 10, 5);
  ctx.fill();
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rigid Left Wall with diagonal hatching
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(wallX - 18, trackY - 76, 18, 92);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(wallX, trackY - 76);
  ctx.lineTo(wallX, trackY + 16);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.rect(wallX - 18, trackY - 76, 18, 92);
  ctx.clip();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  for (let hy = trackY - 80; hy < trackY + 40; hy += 8) {
    ctx.beginPath();
    ctx.moveTo(wallX - 18, hy);
    ctx.lineTo(wallX, hy - 14);
    ctx.stroke();
  }
  ctx.restore();

  // Spring coil geometry with Ep-reactive thermal/elastic glow
  const springStartX = wallX;
  const springEndX = blockX;
  const springY = blockY + blockH * 0.5;
  const epRatio = snap.eTotal > 0 ? snap.ep / snap.eTotal : 0;

  // Color shifts smoothly from cool slate-blue at Ep=0 to warm sky-amber glow at Ep=E
  const springStroke =
    epRatio < 0.5
      ? lerpColor([51, 65, 85], [2, 132, 199], epRatio * 2)
      : lerpColor([2, 132, 199], [245, 158, 11], (epRatio - 0.5) * 2);

  const coils = 14;
  const leadLen = 14;
  const span = Math.max(24, springEndX - springStartX - leadLen * 2);
  const coilAmp = 12;

  ctx.save();
  if (epRatio > 0.15) {
    ctx.shadowColor =
      epRatio > 0.5
        ? `rgba(245, 158, 11, ${0.45 * epRatio})`
        : `rgba(14, 165, 233, ${0.35 * epRatio})`;
    ctx.shadowBlur = 10 * epRatio;
  }
  ctx.strokeStyle = springStroke;
  ctx.lineWidth = 3.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(springStartX, springY);
  ctx.lineTo(springStartX + leadLen, springY);
  for (let i = 0; i <= coils * 2; i++) {
    const tCoil = i / (coils * 2);
    const sx = springStartX + leadLen + tCoil * span;
    const sy =
      i === 0 || i === coils * 2
        ? springY
        : springY + (i % 2 === 1 ? -coilAmp : coilAmp);
    ctx.lineTo(sx, sy);
  }
  ctx.lineTo(springEndX, springY);
  ctx.stroke();
  ctx.restore();

  // Mass Block
  ctx.save();
  ctx.shadowColor = isDragging ? 'rgba(5, 150, 105, 0.38)' : 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = isDragging ? 14 : 8;
  ctx.shadowOffsetY = 3;

  const blockGrad = ctx.createLinearGradient(blockX, blockY, blockX, blockY + blockH);
  if (isDragging) {
    blockGrad.addColorStop(0, '#10b981');
    blockGrad.addColorStop(1, '#047857');
  } else {
    blockGrad.addColorStop(0, '#0284c7');
    blockGrad.addColorStop(1, '#0369a1');
  }
  ctx.fillStyle = blockGrad;
  drawRoundedRect(ctx, blockX, blockY, blockW, blockH, 9);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = isDragging ? '#064e3b' : '#0c4a6e';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, blockX, blockY, blockW, blockH, 9);
  ctx.stroke();

  // Grip notches on block to signal draggability
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.5;
  for (let gi = -1; gi <= 1; gi++) {
    const gx = blockCenterX + gi * 5;
    ctx.beginPath();
    ctx.moveTo(gx, blockY + 7);
    ctx.lineTo(gx, blockY + 13);
    ctx.stroke();
  }

  // Block mass & displacement label
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 12px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${params.m.toFixed(1)} kg`, blockCenterX, blockY + blockH * 0.65);

  // Live x badge above block
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 11px "IBM Plex Mono", monospace';
  ctx.fillText(
    `x = ${snap.x >= 0 ? '+' : ''}${snap.x.toFixed(2)} m`,
    blockCenterX,
    blockY - 10
  );

  // Velocity Vector Arrow
  const maxV = snap.omega0 * params.A;
  const vNorm = maxV > 0 ? snap.v / maxV : 0;
  if (Math.abs(vNorm) > 0.03 && !isDragging) {
    const arrowLen = vNorm * 68;
    const ay = blockY + blockH * 0.5;
    const ax0 = arrowLen > 0 ? blockX + blockW + 4 : blockX - 4;
    const ax1 = ax0 + arrowLen;

    ctx.strokeStyle = '#059669';
    ctx.fillStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ax0, ay);
    ctx.lineTo(ax1, ay);
    ctx.stroke();

    const dir = arrowLen > 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(ax1, ay);
    ctx.lineTo(ax1 - dir * 7, ay - 4.5);
    ctx.lineTo(ax1 - dir * 7, ay + 4.5);
    ctx.closePath();
    ctx.fill();

    ctx.font = '700 10px "IBM Plex Mono", monospace';
    ctx.textAlign = dir > 0 ? 'left' : 'right';
    ctx.fillText(`v`, ax1 + dir * 4, ay - 6);
  }

  // ================= BOTTOM HALF: TRIPLE LIQUID ENERGY TANKS =================
  const tankAreaTop = splitY + 26;
  const tankAreaBottom = height - 26;
  const tankH = Math.max(120, tankAreaBottom - tankAreaTop - 36);
  const tankY = tankAreaTop + 14;
  const tankW = Math.min(118, Math.max(76, (width - 140) / 3.6));
  const totalTanksSpan = tankW * 3 + 56 * 2;
  const startTanksX = (width - totalTanksSpan) / 2 + 12;

  const tankConfigs = [
    {
      label: tDict.canvas.tankEk,
      value: snap.ek,
      pct: snap.ekPct,
      type: 'ek' as const,
      x: startTanksX,
    },
    {
      label: tDict.canvas.tankEp,
      value: snap.ep,
      pct: snap.epPct,
      type: 'ep' as const,
      x: startTanksX + tankW + 56,
    },
    {
      label: tDict.canvas.tankTotal,
      value: snap.eTotal,
      pct: 100,
      type: 'total' as const,
      x: startTanksX + (tankW + 56) * 2,
    },
  ];

  // Constant total energy horizontal dashed reference guide across all 3 tanks
  ctx.save();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.lineWidth = 1.3;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(startTanksX - 24, tankY);
  ctx.lineTo(startTanksX + totalTanksSpan + 18, tankY);
  ctx.stroke();
  ctx.restore();

  // Graduated Joule scale on left of Tank 1
  const scaleX = startTanksX - 18;
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.font = '600 10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right';
  [0, 0.25, 0.5, 0.75, 1].forEach((frac) => {
    const ty = tankY + tankH * (1 - frac);
    ctx.beginPath();
    ctx.moveTo(scaleX - 4, ty);
    ctx.lineTo(scaleX + 2, ty);
    ctx.stroke();
    ctx.fillText(`${(snap.eTotal * frac).toFixed(1)}J`, scaleX - 7, ty + 3);
  });

  // Draw each cylindrical glass tank
  tankConfigs.forEach((tk) => {
    const rx = tk.x;
    const ry = tankY;

    // Glass interior background
    ctx.save();
    drawRoundedRect(ctx, rx, ry, tankW, tankH, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();

    // Liquid fill
    if (tk.type === 'ek' || tk.type === 'ep') {
      const fillRatio = snap.eTotal > 0 ? tk.value / snap.eTotal : 0;
      const fillH = Math.max(0, tankH * fillRatio);
      const fillTopY = ry + tankH - fillH;

      const grad = ctx.createLinearGradient(rx, fillTopY, rx, ry + tankH);
      if (tk.type === 'ek') {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#047857');
      } else {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
      }

      if (fillH > 1) {
        const waveAmp = isDragging ? 0.5 : Math.min(3.5, Math.abs(vNorm) * 4 + 0.8);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(rx, ry + tankH);
        ctx.lineTo(rx, fillTopY);
        const steps = 18;
        for (let s = 0; s <= steps; s++) {
          const sx = rx + (s / steps) * tankW;
          const sy =
            fillTopY +
            Math.sin((s / steps) * Math.PI * 2 + animTime * 6 + (tk.type === 'ep' ? 1.5 : 0)) *
              waveAmp;
          ctx.lineTo(sx, sy);
        }
        ctx.lineTo(rx + tankW, ry + tankH);
        ctx.closePath();
        ctx.fill();

        // Meniscus highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const sx = rx + (s / steps) * tankW;
          const sy =
            fillTopY +
            Math.sin((s / steps) * Math.PI * 2 + animTime * 6 + (tk.type === 'ep' ? 1.5 : 0)) *
              waveAmp;
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    } else {
      // Total Tank: Stacked Ek (bottom Emerald) + Ep (top Sky Blue)
      const ekRatio = snap.eTotal > 0 ? snap.ek / snap.eTotal : 0;
      const ekH = Math.max(0, tankH * ekRatio);
      const epH = Math.max(0, tankH - ekH);

      if (ekH > 0.5) {
        const ekGrad = ctx.createLinearGradient(rx, ry + tankH - ekH, rx, ry + tankH);
        ekGrad.addColorStop(0, '#10b981');
        ekGrad.addColorStop(1, '#047857');
        ctx.fillStyle = ekGrad;
        ctx.fillRect(rx, ry + tankH - ekH, tankW, ekH);
      }
      if (epH > 0.5) {
        const epGrad = ctx.createLinearGradient(rx, ry, rx, ry + epH);
        epGrad.addColorStop(0, '#38bdf8');
        epGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = epGrad;
        ctx.fillRect(rx, ry, tankW, epH);
      }

      // Interface divider line between Ek and Ep inside Total tank
      if (ekH > 2 && epH > 2) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rx, ry + epH);
        ctx.lineTo(rx + tankW, ry + epH);
        ctx.stroke();
      }
    }

    // Subtle glass specular reflection streak
    const glassSheen = ctx.createLinearGradient(rx, ry, rx + tankW * 0.25, ry);
    glassSheen.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    glassSheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glassSheen;
    ctx.fillRect(rx + 4, ry + 4, tankW * 0.22, tankH - 8);

    ctx.restore();

    // Crisp outer glass tank border
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, rx, ry, tankW, tankH, 12);
    ctx.stroke();

    // Value Pill above tank
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 12px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${tk.value.toFixed(2)} J`, rx + tankW / 2, ry - 8);

    // Label below tank
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 12px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
    ctx.fillText(tk.label, rx + tankW / 2, ry + tankH + 18);

    // Percentage below label
    ctx.fillStyle =
      tk.type === 'ek' ? '#047857' : tk.type === 'ep' ? '#0369a1' : '#334155';
    ctx.font = '700 11px "IBM Plex Mono", monospace';
    ctx.fillText(`${tk.pct.toFixed(1)}%`, rx + tankW / 2, ry + tankH + 34);
  });

  return {
    blockX,
    blockY,
    blockW,
    blockH,
    eqX,
    pxPerMeter,
  };
}
