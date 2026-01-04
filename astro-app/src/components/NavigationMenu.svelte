<script lang="ts">
  /**
   * Navigation Menu Island
   * Interactive navigation with active route highlighting
   * 
   * MIGRATION NOTE: Converted from app.js initializeNavigation()
   * Svelte island for client-side routing and state
   */

  import { getAllDomains, type Domain } from '../lib/config';

  export let currentPath = '/';

  const domains = getAllDomains();
  
  interface NavItem {
    href: string;
    label: string;
    isSpecial?: boolean;
  }

  const navItems: NavItem[] = [
    ...domains.map((domain: Domain) => ({
      href: `/${domain.id}`,
      label: domain.displayName,
    })),
    { href: '/notebook', label: 'Notebook', isSpecial: true },
    { href: '/year', label: 'Year', isSpecial: true },
  ];

  function isActive(href: string): boolean {
    if (typeof window === 'undefined') return false;
    const base = '/lifelab';
    const currentRoute = window.location.pathname.replace(base, '') || '/';
    return currentRoute === href || (href !== '/' && currentRoute.startsWith(href));
  }
</script>

<nav class="nav" id="nav">
  <a href="/lifelab/" class="nav-item" class:active={isActive('/')}>
    Dashboard
  </a>
  
  {#each navItems as item}
    <a 
      href={`/lifelab${item.href}`}
      class="nav-item"
      class:nav-item-special={item.isSpecial}
      class:active={isActive(item.href)}
    >
      {item.label}
    </a>
  {/each}
</nav>

<style>
  /* Navigation styles are inherited from main.css */
  /* Additional Svelte-specific overrides can go here */
</style>
