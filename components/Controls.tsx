
import React from 'react';
import { AppMode } from '../types';
import { Upload, Save, PlusCircle, MinusCircle, Plus, Edit3, MousePointerClick } from 'lucide-react';

interface ControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onImageLoad: () => void;
  onMinutiaeLoad: () => void;
  onSave: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  imageLoaded: boolean;
}

const Controls: React.FC<ControlsProps> = ({ zoom, onZoomChange, onImageLoad, onMinutiaeLoad, onSave, mode, setMode, imageLoaded }) => {
    const buttonBaseClass = "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary";
    const primaryButtonClass = "bg-accent hover:bg-blue-500 text-white";
    const secondaryButtonClass = "bg-border-color hover:bg-gray-600 text-text-primary";
    const disabledButtonClass = "bg-gray-700 text-gray-500 cursor-not-allowed";

    const getModeButtonClass = (buttonMode: AppMode) => {
        return mode === buttonMode ? "bg-accent text-white ring-2 ring-accent" : secondaryButtonClass;
    }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-3 border-b border-border-color pb-2">File Operations</h2>
        <div className="space-y-2">
            <button onClick={onImageLoad} className={`${buttonBaseClass} ${primaryButtonClass}`}>
                <Upload size={18} /> Load Image
            </button>
            <button onClick={onMinutiaeLoad} disabled={!imageLoaded} className={`${buttonBaseClass} ${imageLoaded ? secondaryButtonClass : disabledButtonClass}`}>
                <Upload size={18} /> Load Minutiae
            </button>
            <button onClick={onSave} disabled={!imageLoaded} className={`${buttonBaseClass} ${imageLoaded ? secondaryButtonClass : disabledButtonClass}`}>
                <Save size={18} /> Save Minutiae
            </button>
        </div>
      </div>

      {imageLoaded && (
        <>
            <div>
                <h2 className="text-lg font-bold mb-3 border-b border-border-color pb-2">View Controls</h2>
                <label htmlFor="zoom" className="block text-sm font-medium text-text-secondary mb-2">Zoom ({Math.round(zoom * 100)}%)</label>
                <div className="flex items-center gap-2">
                    <MinusCircle className="text-text-secondary cursor-pointer" onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))} />
                    <input
                        id="zoom"
                        type="range"
                        min="0.2"
                        max="5"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer"
                    />
                    <PlusCircle className="text-text-secondary cursor-pointer" onClick={() => onZoomChange(Math.min(5, zoom + 0.1))} />
                </div>
            </div>
            
            <div>
                <h2 className="text-lg font-bold mb-3 border-b border-border-color pb-2">Edit Mode</h2>
                <div className="space-y-2">
                    <button onClick={() => setMode(AppMode.VIEW)} className={`${buttonBaseClass} ${getModeButtonClass(AppMode.VIEW)}`}>
                        <MousePointerClick size={18} /> View / Select
                    </button>
                    <button onClick={() => setMode(AppMode.ADD_ENDING)} className={`${buttonBaseClass} ${getModeButtonClass(AppMode.ADD_ENDING)}`}>
                        <Plus size={18} /> Add Ending
                    </button>
                     <button onClick={() => setMode(AppMode.ADD_BIFURCATION)} className={`${buttonBaseClass} ${getModeButtonClass(AppMode.ADD_BIFURCATION)}`}>
                        <Plus size={18} /> Add Bifurcation
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default Controls;
