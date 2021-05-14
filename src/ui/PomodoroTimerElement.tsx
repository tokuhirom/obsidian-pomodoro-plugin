import React from "react";
import PomodoroTimerPlugin from "../../main";
import moment from "moment";

enum Mode {
  ModePomodoro,
  ModeShortBreak,
  ModeLongBreak,
}

interface PomodoroTimerElementProps {
  plugin: PomodoroTimerPlugin;
}

interface PomodoroTimerElementState {
  mode: Mode;
  time: string;

  startedAt: Date;
  remainMilliSeconds: number;
}

export class PomodoroTimerElement extends React.Component<
  PomodoroTimerElementProps,
  PomodoroTimerElementState
> {
  private intervalId: number;
  constructor(props: PomodoroTimerElementProps) {
    super(props);
    this.state = {
      mode: Mode.ModePomodoro,
      time: PomodoroTimerElement.getTimeString(
        this.props.plugin.settings.pomodoroMinutes * 60 * 1000
      ),
      startedAt: null,
      remainMilliSeconds:
        this.props.plugin.settings.pomodoroMinutes * 60 * 1000,
    };
  }

  componentWillUnmount(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  componentDidUpdate(
    prevProps: Readonly<PomodoroTimerElementProps>,
    prevState: Readonly<PomodoroTimerElementState>
  ): void {
    if (
      prevState.startedAt !== this.state.startedAt ||
      prevState.remainMilliSeconds !== this.state.remainMilliSeconds ||
      prevState.mode !== this.state.mode
    ) {
      this.updateTime();
    }
  }

  private onReset() {
    this.clearInterval();

    this.setState({
      startedAt: null,
      remainMilliSeconds: this.getRemainMilliSecondsByMode(this.state.mode),
    });
  }

  private onStartStop(): void {
    if (this.state.startedAt !== null) {
      const elapsed = Date.now() - this.state.startedAt.getTime();
      this.setState({
        startedAt: null,
        remainMilliSeconds: this.state.remainMilliSeconds - elapsed,
      });
      this.clearInterval();
    } else {
      this.setState({
        startedAt: new Date(),
      });
      this.createInterval();
    }
  }

  render(): JSX.Element {
    return (
      <div className={"pomodoro-timer"}>
        <div className={"mode-switchers-container"}>
          <div
            className={
              "pomodoro " +
              (this.state.mode == Mode.ModePomodoro ? "enabled" : "")
            }
            onClick={this.switchToPomodoro.bind(this)}
          >
            Pomodoro
          </div>
          <div
            className={
              "short-break " +
              (this.state.mode == Mode.ModeShortBreak ? "enabled" : "")
            }
            onClick={this.switchToShortBreak.bind(this)}
          >
            Short Break
          </div>
          <div
            className={
              "long-break " +
              (this.state.mode == Mode.ModeLongBreak ? "enabled" : "")
            }
            onClick={this.switchToLongBreak.bind(this)}
          >
            Long Break
          </div>
        </div>
        <div
          className={
            "time " + (this.getElapsedMilliSeconds() < 0 ? "over" : "")
          }
        >
          {this.state.time}
        </div>
        <button onClick={this.onStartStop.bind(this)}>
          {this.state.startedAt !== null ? "Stop" : "Start"}
        </button>
        <button onClick={this.onReset.bind(this)}>▶|</button>
      </div>
    );
  }

  private updateTime(): void {
    const ms = this.getElapsedMilliSeconds();
    const str = PomodoroTimerElement.getTimeString(ms);
    this.setState({
      time: str,
    });
  }

  private static getTimeString(elapsed: number): string {
    return moment.duration(elapsed).format("mm:ss", {
      trim: false,
    });
  }

  private getElapsedMilliSeconds(): number {
    const remains = this.state.remainMilliSeconds;
    if (this.state.startedAt != null) {
      const elapsed = Date.now() - this.state.startedAt.getTime();
      return remains - elapsed;
    } else {
      return remains;
    }
  }

  switchToPomodoro(): void {
    this.switchMode(Mode.ModePomodoro);
  }

  switchToShortBreak(): void {
    this.switchMode(Mode.ModeShortBreak);
  }

  switchToLongBreak(): void {
    this.switchMode(Mode.ModeLongBreak);
  }

  private switchMode(mode: Mode) {
    if (this.state.mode !== mode) {
      this.setState({
        mode: mode,
        startedAt: null,
        remainMilliSeconds: this.getRemainMilliSecondsByMode(mode),
      });
    }
  }

  private createInterval(): void {
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  private clearInterval() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private getRemainMilliSecondsByMode(mode: Mode): number {
    const plugin = this.props.plugin;
    switch (mode) {
      case Mode.ModePomodoro:
        return plugin.settings.pomodoroMinutes * 60 * 1000;
      case Mode.ModeShortBreak:
        return plugin.settings.shortBreakMinutes * 60 * 1000;
      case Mode.ModeLongBreak:
        return plugin.settings.longBreakMinutes * 60 * 1000;
    }
    throw Error(`Unknown mode: ${mode}`);
  }
}
