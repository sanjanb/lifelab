# Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Initial Setup

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit: Vite + Vanilla JS stack"
   git push origin main
   ```

2. **Enable GitHub Pages**

   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"
   - Save changes

3. **Update Vite Config**

   Edit `vite.config.js` and update the `base` path to match your repository name:

   ```js
   base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
   ```

### Automatic Deployment

Once set up, every push to the `main` branch will automatically:

1. Build the project
2. Deploy to GitHub Pages
3. Make it available at `https://your-username.github.io/your-repo-name/`

### Manual Deployment

If you prefer manual deployment:

```bash
npm run deploy
```

This will build and push to the `gh-pages` branch.

## Local Testing

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Preview

To test the production build locally:

```bash
npm run build
npm run preview
```

Opens at `http://localhost:4173`

## Data Management

### Adding Monthly Data

1. Create a JSON file in `public/data/months/` with the format `YYYY-MM.json`
2. Follow the schema:

   ```json
   [
     {
       "date": "YYYY-MM-DD",
       "domains": {
         "health": 0.7,
         "skills": 0.6,
         "finance": 0.5,
         "academics": 0.8
       },
       "notes": "Optional notes"
     }
   ]
   ```

3. Commit and push - the data will be included in the build

### Editing Data

You can edit data files directly on GitHub:

1. Navigate to `public/data/months/`
2. Click on the file
3. Click "Edit" (pencil icon)
4. Make changes
5. Commit changes

The site will rebuild automatically.

## Troubleshooting

### Site not loading after deployment

1. Check that the `base` path in `vite.config.js` matches your repo name
2. Ensure GitHub Pages is enabled in settings
3. Check the Actions tab for build errors

### Data not showing

1. Verify JSON syntax is valid
2. Check browser console for errors
3. Ensure file is in `public/data/months/` with correct naming

### Build fails

1. Check that all dependencies are installed
2. Run `npm run build` locally to test
3. Check GitHub Actions logs for specific errors

## Project Structure

```
dist/               # Built files (generated)
  ├── index.html
  ├── assets/
  └── data/
      └── months/   # Your data files are copied here

public/
  └── data/
      └── months/   # Source data files

src/               # Source code
  ├── styles/
  ├── data/
  ├── graphs/
  ├── insights/
  └── main.js
```

## Performance

The built site is:

- Fully static (no server needed)
- Optimized and minified
- Cached efficiently
- Fast to load

## Maintenance

### Updating Dependencies

```bash
npm update
npm audit fix
```

### Adding Features

1. Create feature in `src/`
2. Test locally with `npm run dev`
3. Build and preview with `npm run build && npm run preview`
4. Commit and push to deploy

## Migration Notes

This is a complete rewrite from the Astro + Svelte stack:

- No build complexity
- No framework magic
- Plain JavaScript that you can understand
- Data in JSON files, not databases
- Simple, maintainable, boring (in a good way)
