import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
import { VIEW_TYPE_POMODORO } from "./src/Constants";
import { PomodoroTimerView } from "./src/PomodoroTimerView";

import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

momentDurationFormatSetup(moment);

interface PomodoroTimerPluginSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

const DEFAULT_SETTINGS: PomodoroTimerPluginSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

export default class PomodoroTimerPlugin extends Plugin {
  settings: PomodoroTimerPluginSettings;

  async onload(): Promise<void> {
    console.log("loading PomodoroTimerPlugin");

    await this.loadSettings();

    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerView(VIEW_TYPE_POMODORO, (leaf: WorkspaceLeaf) => {
      return new PomodoroTimerView(leaf, this);
    });

    this.app.workspace.onLayoutReady(this.initLeaf.bind(this));
  }

  onunload(): void {
    console.log("unloading PomodoroTimerPlugin");
  }

  initLeaf(): void {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE_POMODORO).length) {
      return;
    }
    this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_POMODORO,
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: PomodoroTimerPlugin;

  constructor(app: App, plugin: PomodoroTimerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    const pomodoroSettings = new Setting(containerEl)
      .setName("Pomodoro duration minutes")
      .setDesc(`${this.plugin.settings.pomodoroMinutes} minutes`)
      .addSlider((text) =>
        text
          .setValue(this.plugin.settings.pomodoroMinutes)
          .onChange(async (value) => {
            this.plugin.settings.pomodoroMinutes = value;
            pomodoroSettings.setDesc(`${value} minutes`);
            await this.plugin.saveSettings();
          })
      );
    const shortBreakSettings = new Setting(containerEl)
      .setName("Short break minutes")
      .setDesc(`${this.plugin.settings.shortBreakMinutes} minutes`)
      .addSlider((text) =>
        text
          .setValue(this.plugin.settings.shortBreakMinutes)
          .onChange(async (value) => {
            this.plugin.settings.shortBreakMinutes = value;
            shortBreakSettings.setDesc(`${value} minutes`);
            await this.plugin.saveSettings();
          })
      );
    const longBreakSettings = new Setting(containerEl)
      .setName("Long break minutes")
      .setDesc(`${this.plugin.settings.longBreakMinutes} minutes`)
      .addSlider((text) =>
        text
          .setValue(this.plugin.settings.longBreakMinutes)
          .onChange(async (value) => {
            this.plugin.settings.longBreakMinutes = value;
            longBreakSettings.setDesc(`${value} minutes`);
            await this.plugin.saveSettings();
          })
      );
  }
}
