type Fed3TweenVars = Record<string, unknown>;
interface Fed3Trigger { start: number; end: number; progress: number; refresh(): void; kill(): void; }
interface Fed3Timeline {
  to(target: object, vars: Fed3TweenVars, position?: number | string): Fed3Timeline;
  set(target: object, vars: Fed3TweenVars, position?: number | string): Fed3Timeline;
  addLabel(label: string, position: number): Fed3Timeline;
  progress(): number;
  progress(value: number, suppressEvents?: boolean): Fed3Timeline;
  scrollTrigger?: Fed3Trigger;
}
interface Window {
  Lenis?: new (options: Record<string, unknown>) => Fed3Lenis;
  fed3Lenis?: Fed3Lenis;
  gsap?: { ticker: { add(fn: (time: number) => void): void; remove(fn: (time: number) => void): void }; registerPlugin(plugin: unknown): void; context(callback: () => void, scope: Element): { revert(): void }; timeline(vars: Fed3TweenVars): Fed3Timeline };
  ScrollTrigger?: { refresh(): void; update(): void; getAll(): Fed3Trigger[]; getById(id: string): Fed3Trigger | undefined };
}
interface Fed3Lenis { raf(time: number): void; on(event: string, callback: () => void): void; scrollTo(target: number | string, options?: Record<string, unknown>): void; resize(): void; stop(): void; start(): void; destroy(): void; }
