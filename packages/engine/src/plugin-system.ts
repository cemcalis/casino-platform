import type { GameRegistry } from './game-registry';

export interface GamePlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  install(registry: GameRegistry): void;
  uninstall(registry: GameRegistry): void;
}

export class PluginLoader {
  private readonly loaded = new Map<string, GamePlugin>();

  load(plugin: GamePlugin, registry: GameRegistry): void {
    if (this.loaded.has(plugin.id)) {
      throw new Error(`Plugin '${plugin.id}' is already loaded`);
    }
    plugin.install(registry);
    this.loaded.set(plugin.id, plugin);
  }

  unload(pluginId: string, registry: GameRegistry): void {
    const plugin = this.loaded.get(pluginId);
    if (!plugin) throw new Error(`Plugin '${pluginId}' is not loaded`);
    plugin.uninstall(registry);
    this.loaded.delete(pluginId);
  }

  isLoaded(pluginId: string): boolean {
    return this.loaded.has(pluginId);
  }

  listLoaded(): readonly GamePlugin[] {
    return Array.from(this.loaded.values());
  }
}
