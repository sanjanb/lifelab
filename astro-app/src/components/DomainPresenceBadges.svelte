<script lang="ts">
  /**
   * Domain Presence Badges Island
   * Shows which domains were active on a given day
   * 
   * MIGRATION NOTE: Converted from notebook.js domain badge rendering
   * Visual indicator only - minimal interaction
   */

  import { getAllDomains, type Domain } from '../lib/config';

  export let dayNumber: number;
  export let activeDomains: string[] = [];

  const allDomains = getAllDomains();
  let hoveredDomain: string | null = null;

  function getDomainConfig(domainId: string): Domain | undefined {
    return allDomains.find(d => d.id === domainId);
  }

  function getDomainDisplayName(domainId: string): string {
    const config = getDomainConfig(domainId);
    return config ? config.displayName : domainId;
  }

  function getDomainColor(domainId: string): string {
    const colors: Record<string, string> = {
      habits: '#4CAF50',
      learning: '#2196F3',
      career: '#FF9800',
      health: '#E91E63'
    };
    return colors[domainId] || '#9E9E9E';
  }
</script>

<div class="domain-badges">
  {#if activeDomains.length === 0}
    <span class="no-activity">-</span>
  {:else}
    {#each activeDomains as domainId (domainId)}
      <span 
        class="domain-badge"
        style="background-color: {getDomainColor(domainId)}"
        title="{getDomainDisplayName(domainId)} - Day {dayNumber}"
        on:mouseenter={() => hoveredDomain = domainId}
        on:mouseleave={() => hoveredDomain = null}
      >
        {getDomainDisplayName(domainId).substring(0, 1)}
      </span>
    {/each}
  {/if}
</div>

<style>
  .domain-badges {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    align-items: center;
    min-height: 24px;
  }

  .no-activity {
    color: #ccc;
    font-size: 0.9rem;
  }

  .domain-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    cursor: default;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .domain-badge:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .domain-badge {
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
    }
  }
</style>
