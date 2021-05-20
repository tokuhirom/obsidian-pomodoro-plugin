import { ItemView, WorkspaceLeaf } from "obsidian";
import PomodoroTimerPlugin from "../main";
import { VIEW_TYPE_POMODORO } from "./Constants";
import React from "react";
import ReactDOM from "react-dom";
import { PomodoroTimerElement } from "./ui/PomodoroTimerElement";

export class PomodoroTimerView extends ItemView {
  private readonly plugin: PomodoroTimerPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: PomodoroTimerPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getDisplayText(): string {
    return "Pomodoro timer";
  }

  getViewType(): string {
    return VIEW_TYPE_POMODORO;
  }

  getIcon(): string {
    return "clock";
  }

  async onOpen(): Promise<void> {
    const dom = this.contentEl;

    ReactDOM.render(<PomodoroTimerElement plugin={this.plugin} />, dom);
  }
}
