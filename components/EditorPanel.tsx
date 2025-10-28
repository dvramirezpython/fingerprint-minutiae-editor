
import React from 'react';
import { type Minutia, MinutiaType } from '../types';
import { Trash2, Settings, MapPin, Compass, Type } from 'lucide-react';

interface EditorPanelProps {
  selectedMinutia: Minutia | null;
  onUpdate: (id: string, updates: Partial<Minutia>) => void;
  onDelete: (id: string) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ selectedMinutia, onUpdate, onDelete }) => {
  if (!selectedMinutia) {
    return (
      <div className="text-center text-text-secondary p-4 border border-dashed border-border-color rounded-lg">
        <Settings size={32} className="mx-auto mb-2" />
        <p>No minutia selected</p>
        <p className="text-xs">Click on a minutia on the image to edit its properties.</p>
      </div>
    );
  }

  const handleTypeChange = (newType: MinutiaType) => {
    onUpdate(selectedMinutia.id, { type: newType });
  };

  const angleInRadians = selectedMinutia.angle * (Math.PI / 180);

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const radians = parseFloat(e.target.value);
    if (!isNaN(radians)) {
      // Convert radians from UI to degrees for state
      const degrees = radians * (180 / Math.PI);
      onUpdate(selectedMinutia.id, { angle: degrees });
    }
  };

  return (
    <div className="p-4 bg-border-color/20 border border-border-color rounded-lg space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><Settings size={20}/>Minutia Editor</h2>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-secondary flex items-center gap-2"><MapPin size={14}/>Coordinates</p>
        <p className="text-xs text-text-primary bg-secondary p-2 rounded">
            X: {selectedMinutia.x.toFixed(4)}, Y: {selectedMinutia.y.toFixed(4)}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary flex items-center gap-2"><Type size={14}/>Type</p>
        <div className="flex gap-2">
          <button onClick={() => handleTypeChange(MinutiaType.ENDING)} className={`flex-1 py-1 px-2 text-sm rounded ${selectedMinutia.type === MinutiaType.ENDING ? 'bg-accent-red text-white' : 'bg-secondary'}`}>Ending</button>
          <button onClick={() => handleTypeChange(MinutiaType.BIFURCATION)} className={`flex-1 py-1 px-2 text-sm rounded ${selectedMinutia.type === MinutiaType.BIFURCATION ? 'bg-accent-blue text-white' : 'bg-secondary'}`}>Bifurcation</button>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="angle" className="text-sm font-medium text-text-secondary flex items-center gap-2"><Compass size={14}/>Orientation ({angleInRadians.toFixed(2)} rad)</label>
        <input
            id="angle"
            type="number"
            min="0"
            max="6.28"
            step="0.01"
            value={angleInRadians.toFixed(2)}
            onChange={handleAngleChange}
            className="w-full h-10 px-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <button onClick={() => onDelete(selectedMinutia.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white">
        <Trash2 size={16} /> Delete Minutia
      </button>
    </div>
  );
};

export default EditorPanel;
