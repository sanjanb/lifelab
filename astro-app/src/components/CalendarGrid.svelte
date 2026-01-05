<script lang="ts">
  /**
   * Calendar Grid Component
   * Visual month calendar showing overview of daily activity
   * 
   * Displays:
   * - Full month grid (Sun-Sat)
   * - Domain presence badges
   * - Quality indicators via border colors
   * - Today highlighting
   * 
   * Click any day to expand details below
   */

  import { onMount, createEventDispatcher } from 'svelte';
  import { getDomainPresenceForDay } from '../lib/notebookSync';
  import { getMonthlyNotebook } from '../lib/storage';
  import { getAllDomains } from '../lib/config';

  export let year: number;
  export let month: number;
  export let currentDay: number | null = null;
  export let selectedDay: number | null = null;

  const dispatch = createEventDispatcher();
  const allDomains = getAllDomains();

  interface CalendarDay {
    dayNumber: number;
    dayName: string;
    date: Date;
    isToday: boolean;
    isInMonth: boolean;
    domains: string[];
    quality: string | null;
  }

  let calendarWeeks: CalendarDay[][] = [];
  let monthName = '';

  onMount(() => {
    buildCalendar();
    
    // Listen for data changes
    window.addEventListener('entryAdded', buildCalendar);
    
    return () => {
      window.removeEventListener('entryAdded', buildCalendar);
    };
  });

  function buildCalendar() {
    // Get month info
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();
    
    // Build array of all days including padding
    const days: CalendarDay[] = [];
    
    // Add padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const paddingDate = new Date(year, month - 1, -startDayOfWeek + i + 1);
      days.push({
        dayNumber: paddingDate.getDate(),
        dayName: paddingDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: paddingDate,
        isToday: false,
        isInMonth: false,
        domains: [],
        quality: null
      });
    }
    
    // Add actual month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isToday = currentDay === day;
      const domains = getDomainPresenceForDay(year, month, day) || [];
      const quality = getDayQuality(day);
      
      days.push({
        dayNumber: day,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date,
        isToday,
        isInMonth: true,
        domains,
        quality
      });
    }
    
    // Add padding days from next month to complete grid
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const paddingDate = new Date(year, month, i);
        days.push({
          dayNumber: paddingDate.getDate(),
          dayName: paddingDate.toLocaleDateString('en-US', { weekday: 'short' }),
          date: paddingDate,
          isToday: false,
          isInMonth: false,
          domains: [],
          quality: null
        });
      }
    }
    
    // Split into weeks
    calendarWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      calendarWeeks.push(days.slice(i, i + 7));
    }
  }

  function getDayQuality(dayNumber: number): string | null {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) return null;
    
    const dayKey = String(dayNumber);
    const day = notebook.days[dayKey];
    
    return day?.quality || null;
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

  function getQualityColor(quality: string | null): string {
    if (!quality) return '#e5e7eb';
    if (quality === '3') return '#10b981'; // green
    if (quality === '2') return '#f59e0b'; // yellow
    if (quality === '1') return '#6b7280'; // gray
    return '#e5e7eb';
  }

  function handleDayClick(day: CalendarDay) {
    if (!day.isInMonth) return;
    
    selectedDay = day.dayNumber;
    dispatch('daySelected', { dayNumber: day.dayNumber });
  }
</script>

<div class="calendar-container">
  <div class="calendar-header">
    <h3>{monthName}</h3>
  </div>

  <div class="calendar-grid">
    <!-- Weekday headers -->
    <div class="weekday-headers">
      <div class="weekday-header">Sun</div>
      <div class="weekday-header">Mon</div>
      <div class="weekday-header">Tue</div>
      <div class="weekday-header">Wed</div>
      <div class="weekday-header">Thu</div>
      <div class="weekday-header">Fri</div>
      <div class="weekday-header">Sat</div>
    </div>

    <!-- Calendar weeks -->
    {#each calendarWeeks as week}
      <div class="calendar-week">
        {#each week as day}
          <button
            class="calendar-day"
            class:in-month={day.isInMonth}
            class:out-month={!day.isInMonth}
            class:today={day.isToday}
            class:selected={selectedDay === day.dayNumber && day.isInMonth}
            style="border-color: {day.isInMonth ? getQualityColor(day.quality) : 'transparent'}"
            on:click={() => handleDayClick(day)}
            disabled={!day.isInMonth}
            title={day.isInMonth ? `${day.dayName}, ${monthName.split(' ')[0]} ${day.dayNumber}` : ''}
          >
            <div class="day-number">{day.dayNumber}</div>
            
            {#if day.isInMonth && day.domains.length > 0}
              <div class="domain-dots">
                {#each day.domains.slice(0, 4) as domainId}
                  <span 
                    class="domain-dot"
                    style="background-color: {getDomainColor(domainId)}"
                    title={domainId}
                  ></span>
                {/each}
                {#if day.domains.length > 4}
                  <span class="domain-dot more">+{day.domains.length - 4}</span>
                {/if}
              </div>
            {/if}
            
            {#if day.isToday}
              <div class="today-indicator">•</div>
            {/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .calendar-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .calendar-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .calendar-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .calendar-grid {
    width: 100%;
  }

  .weekday-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .weekday-header {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    padding: 0.5rem;
  }

  .calendar-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .calendar-day {
    position: relative;
    aspect-ratio: 1;
    min-height: 80px;
    padding: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .calendar-day.in-month {
    background: #fafafa;
  }

  .calendar-day.in-month:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .calendar-day.out-month {
    background: transparent;
    border-color: transparent;
    cursor: not-allowed;
    opacity: 0.3;
  }

  .calendar-day.today {
    background: #eff6ff !important;
    border-color: #3b82f6 !important;
    border-width: 3px;
  }

  .calendar-day.selected {
    background: #dbeafe !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .day-number {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .domain-dots {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.25rem;
  }

  .domain-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .domain-dot.more {
    background: #9ca3af;
    font-size: 0.625rem;
    width: auto;
    padding: 0 4px;
    border-radius: 4px;
    color: white;
    font-weight: 600;
  }

  .today-indicator {
    position: absolute;
    bottom: 4px;
    font-size: 1.5rem;
    color: #3b82f6;
    line-height: 1;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .calendar-container {
      padding: 1rem;
    }

    .calendar-day {
      min-height: 60px;
      padding: 0.25rem;
    }

    .day-number {
      font-size: 0.875rem;
    }

    .weekday-header {
      font-size: 0.75rem;
      padding: 0.25rem;
    }

    .domain-dot {
      width: 6px;
      height: 6px;
    }
  }

  @media (max-width: 480px) {
    .calendar-day {
      min-height: 50px;
    }

    .day-number {
      font-size: 0.75rem;
    }

    .domain-dots {
      gap: 0.125rem;
    }
  }
</style>
