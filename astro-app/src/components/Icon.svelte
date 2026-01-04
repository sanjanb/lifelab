<script lang="ts">
  /**
   * Icon Component
   * Consistent SVG icon system for the application
   */
  
  export let name: string;
  export let size: number = 20;
  export let color: string = 'currentColor';
  
  // Icon path definitions
  const icons: Record<string, string> = {
    // Intent icons
    'flow': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    'focus': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    'ease': 'M14.5 2H9.5L4.5 22h2l1-4h9l1 4h2L14.5 2zm-4 14l3-12 3 12h-6z',
    
    // Quality icons (stars)
    'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    'star-half': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z',
    'star-outline': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 3.5L10.18 9.5l-4.15.6 3 2.93-.71 4.13L12 15.23l3.68 1.93-.71-4.13 3-2.93-4.15-.6L12 5.5z',
    
    // Outcome icons
    'check': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    'minus': 'M19 13H5v-2h14v2z',
    'close': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    
    // Action icons
    'download': 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    'upload': 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
    'lock': 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    
    // Navigation icons
    'chevron-left': 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    'chevron-right': 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    
    // Info icons
    'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
  };
  
  $: iconPath = icons[name] || icons['info'];
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon"
>
  <path d={iconPath} fill={name.includes('star') && !name.includes('outline') ? color : 'none'} />
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
