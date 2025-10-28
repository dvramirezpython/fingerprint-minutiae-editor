
export enum MinutiaType {
  ENDING = 0,
  BIFURCATION = 1,
}

export interface Minutia {
  id: string;
  x: number; // Relative X (0-1)
  y: number; // Relative Y (0-1)
  angle: number; // In degrees (0-360)
  type: MinutiaType;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export enum AppMode {
    VIEW = 'view',
    ADD_ENDING = 'add_ending',
    ADD_BIFURCATION = 'add_bifurcation',
}
