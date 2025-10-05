import { useEffect, useRef, useState } from 'react';
import { MarsScene } from './three/scene.js';
import { TrashSimulation } from './sim/sketch.js';
import { runStore } from './state/runStore.js';
import { Play, RotateCcw, Download } from 'lucide-react';

type Slide = 'hero' | 'simulation' | 'calculations' | 'clean';

function App() {
  const [currentSlide, setCurrentSlide] = useState<Slide>('hero');
  const [metrics, setMetrics] = useState(runStore.getState().metrics);
  const [trashCount, setTrashCount] = useState(100);
  const [speed, setSpeed] = useState(1.0);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000));
  const [isSimRunning, setIsSimRunning] = useState(false);

  const heroContainerRef = useRef<HTMLDivElement>(null);
  const cleanContainerRef = useRef<HTMLDivElement>(null);
  const simContainerRef = useRef<HTMLDivElement>(null);

  const heroSceneRef = useRef<MarsScene | null>(null);
  const cleanSceneRef = useRef<MarsScene | null>(null);
  const simulationRef = useRef<TrashSimulation | null>(null);

  const metricsIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentSlide === 'hero' && heroContainerRef.current && !heroSceneRef.current) {
      heroSceneRef.current = new MarsScene(heroContainerRef.current, false);
    }

    if (currentSlide === 'clean' && cleanContainerRef.current && !cleanSceneRef.current) {
      cleanSceneRef.current = new MarsScene(cleanContainerRef.current, true);
    }

    return () => {
      if (currentSlide !== 'hero' && heroSceneRef.current) {
        heroSceneRef.current.dispose();
        heroSceneRef.current = null;
      }
      if (currentSlide !== 'clean' && cleanSceneRef.current) {
        cleanSceneRef.current.dispose();
        cleanSceneRef.current = null;
      }
    };
  }, [currentSlide]);

  useEffect(() => {
    if (currentSlide === 'simulation' && simContainerRef.current && !simulationRef.current) {
      simulationRef.current = new TrashSimulation(simContainerRef.current, () => {
        setIsSimRunning(false);
        setTimeout(() => {
          setCurrentSlide('calculations');
        }, 1000);
      });
    }

    return () => {
      if (currentSlide !== 'simulation' && simulationRef.current) {
        simulationRef.current.dispose();
        simulationRef.current = null;
      }
    };
  }, [currentSlide]);

  useEffect(() => {
    if (isSimRunning) {
      metricsIntervalRef.current = window.setInterval(() => {
        setMetrics({ ...runStore.getState().metrics });
      }, 100);
    } else {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [isSimRunning]);

  const handleStartSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.start({ trashCount, speed, seed });
      setIsSimRunning(true);
    }
  };

  const handleResetSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.reset();
      runStore.reset();
      setMetrics(runStore.getState().metrics);
      setIsSimRunning(false);
    }
  };

  const handleReplay = () => {
    runStore.reset();
    setMetrics(runStore.getState().metrics);
    setIsSimRunning(false);
    if (simulationRef.current) {
      simulationRef.current.dispose();
      simulationRef.current = null;
    }
    setCurrentSlide('simulation');
  };

  const handleExportData = () => {
    runStore.exportJSON();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white">
      {currentSlide === 'hero' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div
            ref={heroContainerRef}
            className="w-full max-w-3xl h-[500px] rounded-lg overflow-hidden mb-8"
          />
          <h1 className="text-5xl font-bold mb-4 text-center">Mars Trash Cleanup</h1>
          <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl">
            Watch our autonomous robot clean up debris from the Martian surface
          </p>
          <button
            onClick={() => setCurrentSlide('simulation')}
            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Let's see Mars trash
          </button>
        </div>
      )}

      {currentSlide === 'simulation' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <h2 className="text-4xl font-bold mb-6">Trash Collection Simulation</h2>

          <div className="w-full max-w-4xl bg-slate-800 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trash Count: {trashCount}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={trashCount}
                  onChange={(e) => setTrashCount(Number(e.target.value))}
                  disabled={isSimRunning}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Speed: {speed.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  disabled={isSimRunning}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Seed: {seed}</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  disabled={isSimRunning}
                  className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartSimulation}
                disabled={isSimRunning}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
              >
                <Play size={20} />
                Start
              </button>
              <button
                onClick={handleResetSimulation}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          <div
            ref={simContainerRef}
            className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-lg overflow-hidden shadow-2xl mb-6"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{metrics.trashCollected}</div>
              <div className="text-sm text-gray-400">Trash Collected</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {metrics.totalDistance.toFixed(0)}
              </div>
              <div className="text-sm text-gray-400">Distance (px)</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{metrics.steps}</div>
              <div className="text-sm text-gray-400">Steps</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {metrics.timeSeconds.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-400">Time</div>
            </div>
          </div>
        </div>
      )}

      {currentSlide === 'calculations' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h2 className="text-4xl font-bold mb-8">Mission Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Trash Collected</h3>
              <div className="text-5xl font-bold mb-2">{metrics.trashCollected}</div>
              <p className="text-gray-400">pieces of debris removed</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Total Distance</h3>
              <div className="text-5xl font-bold mb-2">{metrics.totalDistance.toFixed(0)}</div>
              <p className="text-gray-400">pixels traveled</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-2 text-yellow-400">Steps Taken</h3>
              <div className="text-5xl font-bold mb-2">{metrics.steps}</div>
              <p className="text-gray-400">collection operations</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Mission Time</h3>
              <div className="text-5xl font-bold mb-2">{metrics.timeSeconds.toFixed(2)}</div>
              <p className="text-gray-400">seconds elapsed</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 shadow-xl md:col-span-2">
              <h3 className="text-xl font-semibold mb-2 text-orange-400">Energy Estimate</h3>
              <div className="text-5xl font-bold mb-2">{metrics.energyKwh.toFixed(4)}</div>
              <p className="text-gray-400">kWh consumed</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
            >
              <Download size={20} />
              Export Data
            </button>
            <button
              onClick={() => setCurrentSlide('clean')}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-all"
            >
              View Clean Mars
            </button>
          </div>
        </div>
      )}

      {currentSlide === 'clean' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="relative">
            <div
              ref={cleanContainerRef}
              className="w-full max-w-3xl h-[500px] rounded-lg overflow-hidden mb-8"
            />
            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              Clean!
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-4 text-center">Mars is Clean!</h2>
          <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl">
            All debris has been successfully collected. The Martian surface is ready for future
            exploration.
          </p>

          <button
            onClick={handleReplay}
            className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            <RotateCcw size={24} />
            Replay Mission
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
