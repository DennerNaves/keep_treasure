export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = () => void;

export interface GameLoopInstance {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  onUpdate: (callback: UpdateCallback) => () => void;
  onRender: (callback: RenderCallback) => () => void;
  isRunning: () => boolean;
}
