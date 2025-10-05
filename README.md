# Mars Trash Cleanup - Interactive 3D Visualization

A production-ready web application featuring a 3D Mars globe and 2D trash collection simulation, optimized for deployment on Hugging Face Static Spaces.

## Features

- **Hero Scene**: Interactive 3D Mars globe with rotating starfield background using Three.js
- **Simulation**: Real-time 2D visualization of autonomous robot collecting debris using p5.js
- **Metrics Dashboard**: Live KPIs including trash collected, distance traveled, time elapsed, and energy consumption
- **Clean Mars View**: Celebratory 3D globe showing a cleaned Mars with replay functionality
- **Data Export**: Download simulation results as JSON

## Tech Stack

- **Three.js** - 3D rendering for Mars globe and starfield
- **p5.js** - 2D canvas simulation at 60fps
- **React + TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

## Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open your browser to the URL shown in terminal (typically `http://localhost:5173`).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deploying to Hugging Face Spaces

### Option 1: Using the Hugging Face Web Interface

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space)
2. Select **Static** as the Space SDK
3. Clone your Space repository locally:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Copy the contents of `dist/` to your Space repository
6. Create a `README.md` in the Space with the following header:
   ```yaml
   ---
   title: Mars Trash Cleanup
   emoji: 🚀
   colorFrom: orange
   colorTo: red
   sdk: static
   pinned: false
   ---
   ```
7. Commit and push:
   ```bash
   git add .
   git commit -m "Deploy Mars Trash Cleanup"
   git push
   ```

### Option 2: Using Git Directly

1. Build the project first:
   ```bash
   npm run build
   ```

2. Initialize a new Space repository or clone an existing one:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
   cd YOUR_SPACE_NAME
   ```

3. Copy built files:
   ```bash
   cp -r path/to/mars-trash-cleanup/dist/* .
   ```

4. Add Space configuration to `README.md`:
   ```yaml
   ---
   title: Mars Trash Cleanup
   emoji: 🚀
   colorFrom: orange
   colorTo: red
   sdk: static
   pinned: false
   ---

   # Mars Trash Cleanup

   Interactive 3D visualization of autonomous Mars debris collection.
   ```

5. Commit and push:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push
   ```

Your Space will be live at `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`

## Configuration

### Mars Texture

The app uses a 2K Mars texture from Solar System Scope. To upgrade to 4K or 8K:

1. Download texture from [Solar System Scope](https://www.solarsystemscope.com/textures/)
2. Replace the URL in `src/three/scene.js` line 71:
   ```javascript
   'https://www.solarsystemscope.com/textures/download/4k_mars.jpg'
   ```

### Simulation Parameters

Adjustable in the UI:
- **Trash Count**: 50-500 pieces (default: 100)
- **Speed**: 0.5x-3x (default: 1.0x)
- **Seed**: Any integer for reproducible results

### Performance Tuning

If experiencing low FPS:
- The app automatically limits pixel ratio to 2
- p5.js runs at 60fps by default
- Reduce trash count for slower devices
- Use 2K texture instead of 4K/8K

## Project Structure

```
├── src/
│   ├── three/
│   │   └── scene.js          # Three.js Mars globe and starfield
│   ├── sim/
│   │   └── sketch.js          # p5.js simulation logic
│   ├── state/
│   │   └── runStore.js        # State management and metrics
│   ├── App.tsx                # Main React component
│   └── main.tsx               # Entry point
├── public/                     # Static assets
└── dist/                       # Built output (after npm run build)
```

## Algorithm

The robot uses a **Greedy Nearest Neighbor** algorithm:
1. Start at position (50, 50)
2. Find the closest uncollected trash point
3. Move toward it using linear interpolation (lerp)
4. Collect when within threshold distance
5. Repeat until all trash is collected

This provides O(n²) complexity but creates clear, visually appealing paths.

## Credits

- **Mars Texture**: [Solar System Scope](https://www.solarsystemscope.com/textures/) (Creative Commons Attribution 4.0)
- **Three.js**: MIT License
- **p5.js**: LGPL License

## License

MIT

## Hugging Face Spaces Resources

- [Static Spaces Documentation](https://huggingface.co/docs/hub/spaces-sdks-static)
- [Spaces Configuration Reference](https://huggingface.co/docs/hub/spaces-config-reference)
- [Example Static Spaces](https://huggingface.co/spaces?sdk=static)
