
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppMode, type ImageDimensions, type Minutia, MinutiaType } from './types';
import Controls from './components/Controls';
import FingerprintViewer from './components/FingerprintViewer';
import EditorPanel from './components/EditorPanel';
import { FileText, Fingerprint, Image as ImageIcon, ZoomIn } from 'lucide-react';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [minutiae, setMinutiae] = useState<Minutia[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedMinutiaId, setSelectedMinutiaId] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.VIEW);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const minutiaeInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent shortcuts when typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'd':
                setMode(AppMode.VIEW);
                break;
            case 'e':
                setMode(AppMode.ADD_ENDING);
                break;
            case 'b':
                setMode(AppMode.ADD_BIFURCATION);
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, []);


  const handleImageLoad = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setImage(e.target?.result as string);
          setImageFile(file);
          setMinutiae([]);
          setSelectedMinutiaId(null);
          setZoom(1);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMinutiaeLoad = (file: File) => {
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;

        const loadedMinutiae: Minutia[] = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map((line, index): Minutia | null => {
            const parts = line.split(/\s+/).map(Number);
            
            if (parts.length < 4 || parts.some(isNaN)) {
              console.warn(`Skipping malformed minutia line ${index + 1}: "${line}"`);
              return null;
            }
            const [x, y, angleInRadians, type] = parts;

            // Convert angle from radians (file) to degrees (internal state)
            const angleInDegrees = angleInRadians * (180 / Math.PI);

            return {
              id: crypto.randomUUID(),
              x,
              y,
              angle: angleInDegrees,
              type: type === MinutiaType.BIFURCATION ? MinutiaType.BIFURCATION : MinutiaType.ENDING,
            };
          })
          .filter((m): m is Minutia => m !== null);

        setMinutiae(loadedMinutiae);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveMinutiae = () => {
    if (!imageFile) {
        alert("Please load an image first.");
        return;
    }
    const minutiaeString = minutiae
      .map(m => {
        // Convert angle from degrees (internal state) to radians (file)
        const angleInRadians = m.angle * (Math.PI / 180);
        return `${m.x.toFixed(6)} ${m.y.toFixed(6)} ${angleInRadians.toFixed(6)} ${m.type}`;
      })
      .join('\n');
    
    const blob = new Blob([minutiaeString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddMinutia = useCallback((x: number, y: number) => {
    if (mode === AppMode.VIEW || !imageDimensions) return;

    const newMinutia: Minutia = {
      id: crypto.randomUUID(),
      x: x / imageDimensions.width,
      y: y / imageDimensions.height,
      angle: 0,
      type: mode === AppMode.ADD_ENDING ? MinutiaType.ENDING : MinutiaType.BIFURCATION,
    };
    setMinutiae(prev => [...prev, newMinutia]);
  }, [mode, imageDimensions]);

  const handleUpdateMinutia = useCallback((id: string, updates: Partial<Minutia>) => {
    setMinutiae(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const handleDeleteMinutia = useCallback((idToDelete: string) => {
    //if (window.confirm('Are you sure you want to delete this minutia?')) {
        setMinutiae(prev => prev.filter(m => m.id !== idToDelete));
        // If the deleted minutia was selected, clear the selection
        if (selectedMinutiaId === idToDelete) {
            setSelectedMinutiaId(null);
        }
    //}
  }, [selectedMinutiaId]); // Depend on selectedMinutiaId to correctly clear it
  
  const selectedMinutia = minutiae.find(m => m.id === selectedMinutiaId) || null;

  return (
    <div className="flex flex-col h-screen bg-primary text-text-primary font-sans">
      <header className="flex items-center justify-between p-3 border-b border-border-color bg-secondary shadow-md">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-accent"/>
          <h1 className="text-xl font-bold text-text-primary">Fingerprint Minutiae Editor</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-secondary border-r border-border-color p-4 flex flex-col gap-6 overflow-y-auto">
          <Controls
            zoom={zoom}
            onZoomChange={setZoom}
            onImageLoad={() => imageInputRef.current?.click()}
            onMinutiaeLoad={() => minutiaeInputRef.current?.click()}
            onSave={handleSaveMinutiae}
            mode={mode}
            setMode={setMode}
            imageLoaded={!!image}
          />
          <EditorPanel
            selectedMinutia={selectedMinutia}
            onUpdate={handleUpdateMinutia}
            onDelete={handleDeleteMinutia}
          />
          <input type="file" ref={imageInputRef} onChange={(e) => e.target.files && handleImageLoad(e.target.files[0])} accept="image/jpeg,image/png,image/jpg" className="hidden" />
          <input type="file" ref={minutiaeInputRef} onChange={(e) => e.target.files && handleMinutiaeLoad(e.target.files[0])} accept=".txt" className="hidden" />
        </aside>

        <main className="flex-1 bg-primary flex items-center justify-center overflow-auto p-4">
          {image && imageDimensions ? (
            <FingerprintViewer
              imageSrc={image}
              imageDimensions={imageDimensions}
              minutiae={minutiae}
              zoom={zoom}
              selectedMinutiaId={selectedMinutiaId}
              onSelectMinutia={setSelectedMinutiaId}
              onAddMinutia={handleAddMinutia}
              onUpdateMinutia={handleUpdateMinutia}
              mode={mode}
            />
          ) : (
             <div className="text-center text-text-secondary flex flex-col items-center gap-4">
               <ImageIcon size={64} />
               <h2 className="text-2xl font-semibold">No Image Loaded</h2>
               <p>Click "Load Image" to start analyzing a fingerprint.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
