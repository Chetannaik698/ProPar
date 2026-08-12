import type { ActivePlatformAdapter } from './types';

export class PlatformDetector {
  constructor(private readonly adapters: readonly ActivePlatformAdapter[]) {}

  detect(location: Location = window.location): ActivePlatformAdapter | null {
    return this.adapters.find((adapter) => adapter.matches(location)) ?? null;
  }
}
