# LifeLab - Mobile Optimization Guide

**Last Updated:** January 8, 2026

---

## Overview

LifeLab is now fully optimized for mobile devices with responsive design, touch-friendly interactions, and no distortions across all screen sizes.

---

## Mobile Features Implemented

### 📱 Responsive Breakpoints

The application uses three main breakpoints:

- **Desktop:** > 768px (default styles)
- **Tablet/Large Mobile:** ≤ 768px
- **Small Mobile:** ≤ 480px
- **Landscape Mobile:** Special handling for landscape orientation

### 🎯 Touch Optimization

#### Minimum Touch Targets

- All interactive elements (buttons, links, inputs) have a minimum size of **44x44px** on touch devices
- This follows Apple's Human Interface Guidelines and Google's Material Design standards

#### Touch Feedback

- Active states for touch feedback (opacity + scale)
- Removed hover effects on touch-only devices
- Added `-webkit-tap-highlight-color: transparent` to prevent default touch highlights
- Custom active states provide visual feedback

### 📐 Layout Adaptations

#### Navigation

- **Desktop:** Horizontal flex layout with wrapping
- **Tablet:** Two-column grid layout
- **Mobile:** Full-width vertical stack

#### Tables

- **Desktop:** Standard table layout
- **Mobile:** Card-based layout with data labels
- Horizontal scroll support with momentum scrolling

#### Grids

- **Insights List:** Auto-fit grid → Single column on mobile
- **Stats Grid:** Multi-column → Single column on mobile
- **Bento Grid:** Responsive grid → Single column on mobile

### 🎨 Typography Scaling

Responsive font sizes prevent text from being too large or too small:

```
Desktop (16px base)
Tablet (15px base)
Mobile (14px base)

H1: 2.25rem → 1.75rem → 1.5rem
H2: 1.5rem → 1.25rem → 1.125rem
Body: 1rem (scales with base)
```

### 🔍 Input Optimization

#### iOS Zoom Prevention

- All form inputs use `font-size: 16px` minimum
- This prevents iOS from auto-zooming on input focus
- Maintains proper viewport without unwanted zoom

#### Touch-Friendly Forms

- Larger padding on mobile (easier to tap)
- Full-width inputs on small screens
- Proper label associations for accessibility

### 🖼️ Visual Elements

#### Graphs & Charts

- **SVG Graphs:** Height reduced on mobile (300px → 250px → 200px)
- **Text Labels:** Font size scaled appropriately
- **Touch Interaction:** Larger tap areas for data points

#### Heatmaps

- Horizontal scroll with momentum scrolling
- Minimum width maintained for readability
- Smooth `-webkit-overflow-scrolling: touch`

### 🎭 Modal & Overlays

- **Desktop:** Fixed max-width, centered
- **Tablet:** 95% width
- **Mobile:** 98% width with adjusted padding
- **Max-height:** 90vh → 95vh on landscape to maximize space

### 🔒 Safe Area Support

Full support for notched devices (iPhone X+):

```css
@supports (padding: max(0px)) {
  body {
    padding-left: max(var(--spacing), env(safe-area-inset-left));
    padding-right: max(var(--spacing), env(safe-area-inset-right));
    padding-top: max(var(--spacing), env(safe-area-inset-top));
    padding-bottom: max(var(--spacing), env(safe-area-inset-bottom));
  }
}
```

### ⚡ Performance Optimizations

#### Smooth Scrolling

- `scroll-behavior: smooth` for in-page navigation
- `-webkit-overflow-scrolling: touch` for momentum scrolling
- Respects `prefers-reduced-motion` for accessibility

#### Hardware Acceleration

- Transform-based animations (instead of position)
- Will-change hints where appropriate
- GPU-accelerated transitions

#### Text Rendering

- `-webkit-font-smoothing: antialiased`
- `-moz-osx-font-smoothing: grayscale`
- `-webkit-text-size-adjust: 100%` prevents unwanted text scaling

---

## Mobile-Specific Styles by Component

### Base Components

#### Buttons

```css
Mobile: padding: 0.75rem 1rem
Touch target: min 44x44px
Full-width option: Available
Active state: opacity: 0.7, scale(0.98)
```

#### Navigation Links

```css
Tablet: 50% width, centered text
Mobile: 100% width, vertical stack
Gap: Reduced from 1rem → 0.5rem → 0.25rem
```

#### Containers

```css
Desktop: padding: 2rem
Tablet: padding: 1rem
Mobile: padding: 0.75rem → 0.5rem
```

### Page-Specific

#### Reflection Journal

- **Editor:** Min-height scales (400px → 300px → 250px)
- **Modal:** Full-width prompt selector on mobile
- **Buttons:** Stack vertically, full-width
- **Reading View:** Optimized margins and font sizes

#### Win Ledger

- **Entry Form:** Textarea height optimized for mobile keyboards
- **Timeline:** Full-width cards with proper spacing
- **Stats:** Single column layout

#### Notebook

- **Table:** Card-based mobile view
- **Quick Entry:** Full-width sliders
- **Month Selector:** Vertical stack on mobile

#### Year Review

- **Heatmap:** Horizontal scroll maintained
- **Stats Grid:** Single column
- **Year Selector:** Full-width buttons

#### Settings

- **Bento Grid:** Single column
- **Domain Config:** Touch-friendly controls
- **Export/Import:** Stacked buttons

---

## Meta Tags

All pages include mobile-optimized meta tags:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
/>
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="theme-color" content="#fafafa" />
```

### Viewport Configuration

- `initial-scale=1.0`: Start at natural size
- `maximum-scale=5.0`: Allow zoom up to 5x (accessibility)
- `user-scalable=yes`: Enable pinch-to-zoom (accessibility requirement)

---

## Accessibility Features

### Screen Readers

- Proper semantic HTML maintained
- ARIA labels where appropriate
- Focus visible styles for keyboard navigation

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast

- Sufficient color contrast ratios (WCAG AA compliant)
- Border styles enhanced on mobile for clarity

---

## Testing Recommendations

### Physical Devices

- ✅ iPhone (various sizes: SE, 12/13/14, Plus/Pro Max)
- ✅ Android phones (various manufacturers)
- ✅ iPad / Android tablets
- ✅ Landscape orientation on all devices

### Browsers

- ✅ Safari (iOS)
- ✅ Chrome (Android & iOS)
- ✅ Firefox (Android)
- ✅ Samsung Internet

### Dev Tools Testing

- Chrome DevTools device emulation
- Firefox Responsive Design Mode
- Safari Responsive Design Mode

### Key Test Scenarios

1. **Navigation:** Tap all nav links across pages
2. **Forms:** Enter data in all inputs (check for zoom)
3. **Scrolling:** Test horizontal scroll on heatmaps/tables
4. **Modals:** Open/close all modals
5. **Gestures:** Pinch-to-zoom, swipe navigation
6. **Orientation:** Switch portrait ↔ landscape
7. **Reflection:** Write/edit/delete reflections
8. **Wins:** Add/view/filter wins
9. **Data Entry:** Enter daily tracking data

---

## Known Optimizations

### Prevent Common Issues

#### ✅ No Horizontal Scroll

- `overflow-x: hidden` on html/body
- Proper width constraints on all elements

#### ✅ No Text Too Small

- Minimum font sizes enforced
- Responsive scaling prevents tiny text

#### ✅ No Unwanted Zoom

- Input font-size ≥ 16px prevents iOS zoom
- Viewport meta tag properly configured

#### ✅ No Tap Delay

- Touch-action optimizations
- Fast-click implementations where needed

#### ✅ No Layout Shift

- Fixed dimensions where appropriate
- Aspect ratios maintained for media

---

## Utility Classes

Available in `mobile.css`:

```css
.mobile-hide         /* Hide on mobile */
/* Hide on mobile */
.mobile-show         /* Show only on mobile */
.mobile-full-width   /* Force 100% width on mobile */
.mobile-center       /* Center text on mobile */
.mobile-stack        /* Stack flex items vertically */
.scrollable          /* Enhanced scrolling with custom scrollbars */
.sticky-header; /* Sticky positioning with safe-area support */
```

---

## Future Enhancements

Potential additions (not yet implemented):

- [ ] PWA manifest for "Add to Home Screen"
- [ ] Service worker for offline support
- [ ] Pull-to-refresh on timeline views
- [ ] Swipe gestures for navigation
- [ ] Haptic feedback on interactions (where supported)
- [ ] Dark mode support
- [ ] Tablet-specific layouts (between mobile and desktop)

---

## Performance Metrics

Target performance on mobile:

- **First Contentful Paint:** < 2s on 3G
- **Time to Interactive:** < 5s on 3G
- **Layout Shift:** < 0.1
- **Touch Response:** < 100ms
- **Smooth Scrolling:** 60fps maintained

---

## Browser Support

### Fully Supported

- ✅ iOS Safari 14+
- ✅ Chrome Android 90+
- ✅ Firefox Android 90+
- ✅ Samsung Internet 14+

### Gracefully Degraded

- ⚠️ Older browsers get functional design without all optimizations
- ⚠️ CSS Grid fallbacks in place
- ⚠️ Flexbox used as primary layout method

---

## Troubleshooting

### Issue: Text is too small

**Solution:** Check base font-size at each breakpoint

### Issue: Elements overlap

**Solution:** Review padding/margin at mobile breakpoints

### Issue: Horizontal scroll appears

**Solution:** Check for fixed-width elements, add max-width: 100%

### Issue: Inputs zoom on focus (iOS)

**Solution:** Ensure input font-size ≥ 16px

### Issue: Poor touch response

**Solution:** Verify min-height/width of 44px on touch targets

---

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

_Mobile optimization is complete. The site is now fully responsive and touch-friendly._
