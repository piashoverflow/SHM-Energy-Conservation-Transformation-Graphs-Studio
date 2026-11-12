import { EnergySnapshot, SimulationParams, TimeSeriesPoint } from '../types/physics';
import { TranslationDict } from '../i18n/translations';

export interface Module3HitGeometry {
  plotLeft: number;
  plotRight: number;
  tMax: number;
}

export function renderModule3(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: SimulationParams,
  series: TimeSeriesPoint[],
  snap: EnergySnapshot,
  tMax: number,
  tDict: TranslationDict
): Module3HitGeometry {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 64;
  const padRight = 32;
  const plotLeft = padLeft;
  const plotRight = width - padRight;
  const plotW = Math.max(120, plotRight - plotLeft);

  const topPlotTop = 36;
  const topPlotH = Math.round(height * 0.27);
  const topPlotBottom = topPlotTop + topPlotH;

  const botPlotTop = topPlotBottom + 56;
  const botPlotBottom = height - 44;
  const botPlotH = Math.max(140, botPlotBottom - botPlotTop);

  const A = params.A;
  const T = snap.period;
  const eTotal = snap.eTotal;
  const isDamped = params.dampingEnabled && params.b > 0.0001;

  const tToPx = (tVal: number) => plotLeft + (tVal / tMax) * plotW;
  const xToPy = (xVal: number) => topPlotTop + topPlotH / 2 - (xVal / (A * 1.15)) * (topPlotH / 2);
  const eToPy = (eVal: number) => botPlotBottom - (eVal / (eTotal * 1.16)) * botPlotH;

  // ================= TOP PLOT: x(t) DISPLACEMENT VS TIME =================
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 12px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(tDict.canvas.dispPlotTitle, plotLeft, topPlotTop - 12);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(plotLeft, topPlotTop, plotW, topPlotH);
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(plotLeft, topPlotTop, plotW, topPlotH);

  // Zero displacement centerline
  const yZeroX = xToPy(0);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(plotLeft, yZeroX);
  ctx.lineTo(plotRight, yZeroX);
  ctx.stroke();

  // +A and -A guidelines
  [A, -A].forEach((val, idx) => {
    const gy = xToPy(val);
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(plotLeft, gy);
    ctx.lineTo(plotRight, gy);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#475569';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(idx === 0 ? '+A' : '-A', plotLeft - 8, gy + 3);
  });

  // Vertical quarter-period gridlines across both plots
  const totalQuarters = Math.round(params.timeWindowPeriods * 4);
  for (let q = 0; q <= totalQuarters; q++) {
    const qt = (q / 4) * T;
    if (qt > tMax + 1e-6) break;
    const qx = tToPx(qt);
    const isFullPeriod = q % 4 === 0;
    const isHalfPeriod = q % 2 === 0;

    [
      [topPlotTop, topPlotBottom],
      [botPlotTop, botPlotBottom],
    ].forEach(([y1, y2]) => {
      ctx.save();
      ctx.strokeStyle = isFullPeriod
        ? 'rgba(15, 23, 42, 0.28)'
        : isHalfPeriod
          ? 'rgba(2, 132, 199, 0.25)'
          : 'rgba(186, 230, 253, 0.55)';
      ctx.lineWidth = isFullPeriod ? 1.5 : 1;
      if (!isFullPeriod) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(qx, y1);
      ctx.lineTo(qx, y2);
      ctx.stroke();
      ctx.restore();
    });

    if (isHalfPeriod) {
      const label =
        q === 0
          ? '0'
          : q === 2
            ? 'T/2'
            : q === 4
              ? 'T'
              : `${(q / 4).toFixed(q % 4 === 0 ? 0 : 1)}T`;
      ctx.fillStyle = isFullPeriod ? '#0f172a' : '#0369a1';
      ctx.font = isFullPeriod
        ? '700 11px "IBM Plex Mono", monospace'
        : '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, qx, botPlotBottom + 16);
      ctx.fillStyle = '#64748b';
      ctx.font = '500 9px "IBM Plex Mono", monospace';
      ctx.fillText(`${qt.toFixed(2)}s`, qx, botPlotBottom + 28);
    }
  }

  // Damping envelope around x(t)
  if (isDamped && series.length > 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    [1, -1].forEach((sign) => {
      ctx.beginPath();
      series.forEach((pt, idx) => {
        const px = tToPx(pt.t);
        const py = xToPy(sign * pt.envelope);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
    ctx.restore();
  }

  // x(t) curve
  if (series.length > 1) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    series.forEach((pt, idx) => {
      const px = tToPx(pt.t);
      const py = xToPy(pt.x);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  // Bracket showing 1 full displacement period T
  const tBracketEnd = Math.min(tMax, T);
  if (tBracketEnd >= T * 0.99) {
    const bx0 = tToPx(0);
    const bx1 = tToPx(T);
    const by = topPlotBottom + 14;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx0, by - 5);
    ctx.lineTo(bx0, by);
    ctx.lineTo(bx1, by);
    ctx.lineTo(bx1, by - 5);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 10px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tDict.canvas.periodBracket, (bx0 + bx1) / 2, by + 13);
  }

  // ================= BOTTOM PLOT: Ek(t), Ep(t), E(t), Eloss(t) =================
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 12px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(tDict.canvas.energyPlotTitle, plotLeft, botPlotTop - 10);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(plotLeft, botPlotTop, plotW, botPlotH);
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(plotLeft, botPlotTop, plotW, botPlotH);

  // Horizontal energy gridlines (0.5E, E)
  [0.5, 1.0].forEach((f) => {
    const gy = eToPy(eTotal * f);
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotLeft, gy);
    ctx.lineTo(plotRight, gy);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(f === 1 ? 'E₀' : '½E₀', plotLeft - 8, gy + 3);
  });

  // Double-frequency visual callout bands in [0, T/2] and [T/2, T]
  if (!isDamped && T <= tMax + 1e-4) {
    const x0 = tToPx(0);
    const xHalf = tToPx(T / 2);
    const xFull = tToPx(T);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
    ctx.fillRect(x0, botPlotTop, xHalf - x0, botPlotH);
    ctx.fillStyle = 'rgba(2, 132, 199, 0.05)';
    ctx.fillRect(xHalf, botPlotTop, xFull - xHalf, botPlotH);

    ctx.fillStyle = '#047857';
    ctx.font = '700 10px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tDict.canvas.energyCycle1, (x0 + xHalf) / 2, botPlotTop + 15);
    ctx.fillStyle = '#0369a1';
    ctx.fillText(tDict.canvas.energyCycle2, (xHalf + xFull) / 2, botPlotTop + 15);
  }

  // Conserved Total Energy E0 reference line
  const yE0 = eToPy(eTotal);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(plotLeft, yE0);
  ctx.lineTo(plotRight, yE0);
  ctx.stroke();

  if (series.length > 1) {
    // If damped, draw Thermal Energy Dissipated (Eloss) Rose Red curve + translucent fill
    if (isDamped) {
      ctx.beginPath();
      ctx.moveTo(tToPx(series[0].t), eToPy(0));
      series.forEach((pt) => {
        ctx.lineTo(tToPx(pt.t), eToPy(pt.eLoss));
      });
      ctx.lineTo(tToPx(series[series.length - 1].t), eToPy(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(225, 29, 72, 0.1)';
      ctx.fill();

      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      series.forEach((pt, idx) => {
        const px = tToPx(pt.t);
        const py = eToPy(pt.eLoss);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Mechanical Energy Decay Envelope E_mech(t)
      ctx.save();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      series.forEach((pt, idx) => {
        const px = tToPx(pt.t);
        const py = eToPy(pt.eMech);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Ep(t) Sky Blue curve
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    series.forEach((pt, idx) => {
      const px = tToPx(pt.t);
      const py = eToPy(pt.ep);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Ek(t) Emerald Green curve
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    series.forEach((pt, idx) => {
      const px = tToPx(pt.t);
      const py = eToPy(pt.ek);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  // Interactive Time Playhead across BOTH plots
  const curPx = tToPx(snap.t);
  ctx.save();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(curPx, topPlotTop);
  ctx.lineTo(curPx, botPlotBottom);
  ctx.stroke();
  ctx.restore();

  // Playhead dots on x(t), Ek(t), Ep(t), and Eloss(t)
  const playDots = [
    { py: xToPy(snap.x), color: '#0f172a' },
    { py: eToPy(snap.ek), color: '#059669' },
    { py: eToPy(snap.ep), color: '#0284c7' },
  ];
  if (isDamped) {
    playDots.push({ py: eToPy(snap.eLoss), color: '#e11d48' });
  }
  playDots.forEach((d) => {
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(curPx, d.py, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Callout footer inside bottom plot
  ctx.fillStyle = isDamped ? '#be123c' : '#0369a1';
  ctx.font = '700 11px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    isDamped ? tDict.canvas.conservedLine : tDict.canvas.doubleFreqCallout,
    plotRight - 8,
    yE0 - 8
  );

  // Axis Title
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 11px "Plus Jakarta Sans", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tDict.canvas.timeAxis, (plotLeft + plotRight) / 2, height - 6);

  return {
    plotLeft,
    plotRight,
    tMax,
  };
}
