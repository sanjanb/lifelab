<script lang="ts">
  /**
   * Daily Activity Graph Component
   * Line graph showing number of active domains per day
   * 
   * DESIGN PRINCIPLES:
   * - Descriptive, not evaluative
   * - No smoothing
   * - No goal lines
   * - No labels like "productivity" or "performance"
   * - Visual stability (minimal re-renders)
   */

  import { onMount } from 'svelte';

  export let dailyCounts: number[]; // Array of domain counts per day
  export let daysInMonth: number;
  export let currentDay: number | null = null; // Highlight today

  let canvasEl: HTMLCanvasElement;
  let containerWidth = 0;
  let containerHeight = 300;

  $: maxCount = Math.max(...dailyCounts, 1);
  $: chartData = dailyCounts.slice(0, daysInMonth);

  function drawGraph() {
    if (!canvasEl) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvasEl.offsetWidth;
    const height = containerHeight;

    canvasEl.width = width * dpr;
    canvasEl.height = height * dpr;
    ctx.scale(dpr, dpr);

    canvasEl.style.width = `${width}px`;
    canvasEl.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Padding
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw background grid (subtle)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Y-axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    // X-axis
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Draw Y-axis labels (domain count)
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= maxCount; i++) {
      const y = padding.top + chartHeight - (chartHeight / maxCount) * i;
      ctx.fillText(i.toString(), padding.left - 10, y);
    }

    // Draw X-axis labels (days)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const dayStep = daysInMonth > 20 ? 5 : 1;
    for (let day = 1; day <= daysInMonth; day += dayStep) {
      const x = padding.left + ((day - 0.5) / daysInMonth) * chartWidth;
      ctx.fillText(day.toString(), x, padding.top + chartHeight + 10);
    }

    // Highlight today's column (if current month)
    if (currentDay && currentDay <= daysInMonth) {
      const x = padding.left + ((currentDay - 0.5) / daysInMonth) * chartWidth;
      ctx.fillStyle = 'rgba(34, 34, 34, 0.05)';
      ctx.fillRect(
        x - chartWidth / daysInMonth / 2,
        padding.top,
        chartWidth / daysInMonth,
        chartHeight
      );
    }

    // Draw line graph
    if (chartData.length === 0) return;

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    chartData.forEach((count, index) => {
      const day = index + 1;
      const x = padding.left + ((day - 0.5) / daysInMonth) * chartWidth;
      const y = padding.top + chartHeight - (chartHeight / maxCount) * count;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#222';
    chartData.forEach((count, index) => {
      const day = index + 1;
      const x = padding.left + ((day - 0.5) / daysInMonth) * chartWidth;
      const y = padding.top + chartHeight - (chartHeight / maxCount) * count;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  onMount(() => {
    containerWidth = canvasEl.offsetWidth;
    drawGraph();

    const handleResize = () => {
      containerWidth = canvasEl.offsetWidth;
      drawGraph();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  $: if (canvasEl && chartData) {
    drawGraph();
  }
</script>

<div class="graph-container">
  <h3 class="graph-title">Daily Domain Activity</h3>
  <div class="graph-description">
    Number of active domains each day
  </div>
  <canvas bind:this={canvasEl} class="activity-graph"></canvas>
</div>

<style>
  .graph-container {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .graph-title {
    font-size: 1rem;
    font-weight: 600;
    color: #222;
    margin: 0 0 0.25rem 0;
  }

  .graph-description {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 1.5rem;
  }

  .activity-graph {
    width: 100%;
    display: block;
  }

  @media (max-width: 640px) {
    .graph-container {
      padding: 1rem;
    }

    .graph-title {
      font-size: 0.9375rem;
    }

    .graph-description {
      font-size: 0.8125rem;
      margin-bottom: 1rem;
    }
  }
</style>
