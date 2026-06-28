export type TransitionGuard<TState extends string, TEvent extends string> = (
  state: TState,
  event: TEvent,
) => boolean;

export interface Transition<TState extends string, TEvent extends string> {
  readonly from: TState | '*';
  readonly on: TEvent;
  readonly to: TState;
  readonly guard?: TransitionGuard<TState, TEvent>;
}

export interface StateMachineConfig<TState extends string, TEvent extends string> {
  readonly initial: TState;
  readonly transitions: ReadonlyArray<Transition<TState, TEvent>>;
}

export class StateMachine<TState extends string, TEvent extends string> {
  private current: TState;
  private readonly transitions: ReadonlyArray<Transition<TState, TEvent>>;

  constructor(config: StateMachineConfig<TState, TEvent>) {
    this.current = config.initial;
    this.transitions = config.transitions;
  }

  get state(): TState {
    return this.current;
  }

  can(event: TEvent): boolean {
    return this.findTransition(event) !== undefined;
  }

  send(event: TEvent): TState {
    const transition = this.findTransition(event);
    if (!transition) {
      throw new Error(`No transition from '${this.current}' on event '${event}'`);
    }
    this.current = transition.to;
    return this.current;
  }

  reset(state: TState): void {
    this.current = state;
  }

  private findTransition(event: TEvent): Transition<TState, TEvent> | undefined {
    return this.transitions.find(
      (t) =>
        (t.from === '*' || t.from === this.current) &&
        t.on === event &&
        (t.guard === undefined || t.guard(this.current, event)),
    );
  }
}
