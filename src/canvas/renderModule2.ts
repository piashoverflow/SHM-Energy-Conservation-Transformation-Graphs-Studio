import { EnergySnapshot, SimulationParams } from '../types/physics';
import { TranslationDict } from '../i18n/translations';

export interface Module2HitGeometry {
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
}

export function renderModule2(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: SimulationParams,
  snap: EnergySnapshot,
  tDict: TranslationDict
): Module2HitGeometry {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 64;
  const padRight = 36;
  const miniStripH = Math.round(height * 0.22);
  const plotTop = miniStripH + 26;
  const plotBottom = height - 48;
  const plotLeft = padLeft;
  const plotRight = width - padRight;
  const plotW = Math.max(120, plotRight - plotLeft);
  const plotH = Math.max(160, plotBottom - plotTop);

  const A = params.A;
  const k = params.k;
  const eTotal = snap.eTotal;
  const eMaxAxis = Math.max(1e-3, eTotal * 1.15);

  const xToPx = (xVal: number) => plotLeft + ((xVal + A) / (2 * A)) * plotW;
  const eToPy = (eVal: number) => plotBottom - (eVal / eMaxAxis) * plotH;

  // ================= TOP STRIP: ALIGNED MINI OSCILLATOR =================
  const eqPx = xToPx(0);
  const trackY = Math.round(miniStripH * 0.62);
  const blockPx = xToPx(snap.x);

  // Subtle backdrop for oscillator strip
  ctx.fillStyle = '#f0f9ff';
  ctx.fillRect(plotLeft - 12, 10, plotW + 24, miniStripH - 14);
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1;
  ctx.strokeRect(plotLeft - 12, 10, plotW + 24, miniStripH - 14);

  // Rail
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(plotLeft, trackY + 12);
  ctx.lineTo(plotRight, trackY + 12);
  ctx.stroke();

  // Spring from left anchor to block
  const wallX = plotLeft - 8;
  const blockW = 34;
  const blockH = 26;
  const springEnd = blockPx - blockW / 2;
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(wallX, trackY);
  const coils = 10;
  const lead = 6;
  const sSpan = Math.max(12, springEnd - wallX - lead * 2);
  ctx.lineTo(wallX + lead, trackY);
  for (let i = 0; i <= coils * 2; i++) {
    const tC = i / (coils * 2);
    const sx = wallX + lead + tC * sSpan;
    const sy = i === 0 || i === coils * 2 ? trackY : trackY + (i % 2 === 1 ? -7 : 7);
    ctx.lineTo(sx, sy);
  }
  ctx.lineTo(springEnd, trackY);
  ctx.stroke();

  // Mass block aligned 1:1 with x-axis below
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(blockPx - blockW / 2, trackY - blockH / 2, blockW, blockH, 6);
  ctx.fill();
  ctx.strokeStyle = '#0c4a6e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('m', blockPx, trackY + 3.5);

  // ================= MAIN E-x PARABOLIC PLOTTER =================
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(plotLeft, plotTop, plotW, plotH);
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

  // Horizontal grid lines for 0, 1/4E, 1/2E, 3/4E, E
  const eFracs = [
    { f: 0.25, label: '¼E' },
    { f: 0.5, label: '½E' },
    { f: 0.75, label: '¾E' },
    { f: 1.0, label: 'E' },
  ];
  eFracs.forEach(({ f, label }) => {
    const gy = eToPy(eTotal * f);
    ctx.strokeStyle = f === 1 ? 'rgba(15, 23, 42, 0.12)' : 'rgba(186, 230, 253, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotLeft, gy);
    ctx.lineTo(plotRight, gy);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(label, plotLeft - 8, gy + 4);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 9px "IBM Plex Mono", monospace';
    ctx.fillText(`${(eTotal * f).toFixed(1)}`, plotLeft - 8, gy + 15);
  });

  // Vertical X-axis landmarks
  const xTicks = [
    { val: -A, label: '-A', highlight: false },
    { val: -A * Math.SQRT1_2, label: '-A/√2', highlight: true },
    { val: -A * 0.5, label: '-A/2', highlight: false },
    { val: 0, label: '0', highlight: false },
    { val: A * 0.5, label: '+A/2', highlight: false },
    { val: A * Math.SQRT1_2, label: '+A/√2', highlight: true },
    { val: A, label: '+A', highlight: false },
  ];

  xTicks.forEach((tk) => {
    const tx = xToPx(tk.val);
    ctx.save();
    if (tk.highlight) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tx, eToPy(eTotal * 0.5));
      ctx.lineTo(tx, plotBottom);
      ctx.stroke();
    } else {
      ctx.strokeStyle = tk.val === 0 ? 'rgba(15, 23, 42, 0.25)' : 'rgba(186, 230, 253, 0.6)';
      ctx.lineWidth = tk.val === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(tx, plotTop);
      ctx.lineTo(tx, plotBottom);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = tk.highlight ? '#b45309' : '#334155';
    ctx.font = tk.highlight
      ? '700 11px "IBM Plex Mono", monospace'
      : '600 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tk.label, tx, plotBottom + 16);
  });

  // Axis Titles
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 11px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${tDict.canvas.dispAxis}  [-${A.toFixed(2)} m .. +${A.toFixed(2)} m]`, eqPx, plotBottom + 36);

  ctx.save();
  ctx.translate(16, plotTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(tDict.canvas.energyAxis, 0, 0);
  ctx.restore();

  // Translucent parabolic fills
  const samples = 180;
  // Ep area fill
  ctx.beginPath();
  ctx.moveTo(xToPx(-A), eToPy(0));
  for (let i = 0; i <= samples; i++) {
    const xv = -A + (i / samples) * (2 * A);
    const epVal = 0.5 * k * xv * xv;
    ctx.lineTo(xToPx(xv), eToPy(epVal));
  }
  ctx.lineTo(xToPx(A), eToPy(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(2, 132, 199, 0.09)';
  ctx.fill();

  // Ek area fill
  ctx.beginPath();
  ctx.moveTo(xToPx(-A), eToPy(0));
  for (let i = 0; i <= samples; i++) {
    const xv = -A + (i / samples) * (2 * A);
    const ekVal = 0.5 * k * (A * A - xv * xv);
    ctx.lineTo(xToPx(xv), eToPy(ekVal));
  }
  ctx.lineTo(xToPx(A), eToPy(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(5, 150, 105, 0.09)';
  ctx.fill();

  // Total Energy Horizontal Constant Line
  const yTotal = eToPy(eTotal);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, yTotal);
  ctx.lineTo(plotRight, yTotal);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 11px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${tDict.canvas.constantLine} = ${eTotal.toFixed(2)} J`, plotLeft + 10, yTotal - 8);

  // Ep Upright Parabola (Sky Blue)
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const xv = -A + (i / samples) * (2 * A);
    const py = eToPy(0.5 * k * xv * xv);
    if (i === 0) ctx.moveTo(xToPx(xv), py);
    else ctx.lineTo(xToPx(xv), py);
  }
  ctx.stroke();

  // Ek Inverted Parabola (Emerald Green)
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const xv = -A + (i / samples) * (2 * A);
    const py = eToPy(0.5 * k * (A * A - xv * xv));
    if (i === 0) ctx.moveTo(xToPx(xv), py);
    else ctx.lineTo(xToPx(xv), py);
  }
  ctx.stroke();

  // Highlighted Intersection Markers at (±A/√2, E/2)
  [-A * Math.SQRT1_2, A * Math.SQRT1_2].forEach((ix) => {
    const px = xToPx(ix);
    const py = eToPy(eTotal * 0.5);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = '#b45309';
  ctx.font = '700 10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(tDict.canvas.intersectionLabel, xToPx(A * Math.SQRT1_2), eToPy(eTotal * 0.5) - 14);
  ctx.fillText(tDict.canvas.intersectionLabel, xToPx(-A * Math.SQRT1_2), eToPy(eTotal * 0.5) - 14);

  // ================= SYNCHRONIZED VERTICAL SCRUBBER LINE =================
  const curPx = xToPx(snap.x);
  const curPyEp = eToPy(snap.ep);
  const curPyEk = eToPy(snap.ek);

  // Connecting vertical dashed line up to mini oscillator block!
  ctx.save();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(curPx, trackY + blockH / 2);
  ctx.lineTo(curPx, plotBottom);
  ctx.stroke();
  ctx.restore();

  // Glowing Dots on Total, Ep, and Ek curves
  const dots = [
    { py: yTotal, color: '#0f172a', label: `E: ${eTotal.toFixed(2)}J` },
    { py: curPyEk, color: '#059669', label: `Ek: ${snap.ek.toFixed(2)}J` },
    { py: curPyEp, color: '#0284c7', label: `Ep: ${snap.ep.toFixed(2)}J` },
  ];

  dots.forEach((d) => {
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(curPx, d.py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Compact HUD readout box near scrubber (flip left/right to stay inside plot)
  const hudW = 112;
  const hudH = 58;
  const hudX = curPx + 14 + hudW > plotRight ? curPx - hudW - 14 : curPx + 14;
  const hudY = Math.max(plotTop + 12, Math.min(plotBottom - hudH - 12, eToPy(eTotal * 0.65)));

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, hudW, hudH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`x = ${snap.x >= 0 ? '+' : ''}${snap.x.toFixed(2)} m`, hudX + 8, hudY + 15);
  ctx.fillStyle = '#059669';
  ctx.fillText(`Ek = ${snap.ek.toFixed(2)} J`, hudX + 8, hudY + 32);
  ctx.fillStyle = '#0284c7';
  ctx.fillText(`Ep = ${snap.ep.toFixed(2)} J`, hudX + 8, hudY + 48);

  return {
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
  };
}
