import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { StepId, StepSchema, StepStatus } from './step-schema';

export class StepEngine {
  private steps: StepSchema[] = [];
  private currentIndex$ = new BehaviorSubject<number>(0);
  private statuses$ = new BehaviorSubject<Record<StepId, StepStatus>>({});
  private loading$ = new BehaviorSubject<boolean>(false);

  // public obsevables to wire into UIs
  public currentIndex = this.currentIndex$.asObservable();
  public statuses = this.statuses$.asObservable();
  public loading = this.loading$.asObservable();

  // external context (e.g., property id) — parents can set
  public context: Record<string, any> = {};

  constructor(steps: StepSchema[] = []) {
    if (steps.length) this.init(steps);
  }

  init(steps: StepSchema[]) {
    this.steps = steps;
    const initialStatuses: Record<StepId, StepStatus> = {};
    for (const s of steps) {
      initialStatuses[s.id] = 'LOCKED';
    }
    // first step becomes ONGOING
    if (steps.length) initialStatuses[steps[0].id] = 'ONGOING';
    this.statuses$.next(initialStatuses);
    this.currentIndex$.next(0);
  }

  getStep(index: number): StepSchema | undefined {
    return this.steps[index];
  }

  getSteps(): StepSchema[] {
    return this.steps.slice();
  }

  getCurrentIndex(): number {
    return this.currentIndex$.value;
  }

  getCurrentStep(): StepSchema | undefined {
    return this.steps[this.getCurrentIndex()];
  }

  getContext(key?: string) {
    return key ? this.context[key] : this.context;
  }

  setContext(ctx: Record<string, any>) {
    this.context = { ...this.context, ...ctx };
  }

  getStepStatus(stepId: StepId): StepStatus | undefined {
    return this.statuses$.value[stepId];
  }

  setStepStatus(stepId: StepId, status: StepStatus) {
    const s = { ...this.statuses$.value };
    s[stepId] = status;
    this.statuses$.next(s);
  }

  async loadStep(index: number) {
    const step = this.getStep(index);
    if (!step || !step.load) return null;
    this.setStepStatus(step.id, 'ONGOING');
    this.loading$.next(true);
    try {
      const resp = await firstValueFrom(step.load(this.context));
      if (step.mapIn) {
        const patch = step.mapIn(resp);
        step.formGroup.patchValue(patch);
      }
      this.setStepStatus(step.id, 'COMPLETED');
      return resp;
    } catch (e) {
      this.setStepStatus(step.id, 'ERROR');
      throw e;
    } finally {
      this.loading$.next(false);
    }
  }

  async saveStep(index: number) {
    const step = this.getStep(index);
    if (!step) throw new Error('STEP_NOT_FOUND');

    // Validate
    if (!step.formGroup.valid) {
      step.formGroup.markAllAsTouched();
      this.setStepStatus(step.id, 'ONGOING');
      throw new Error('INVALID_FORM');
    }

    // build payload
    const payload = step.mapOut
      ? step.mapOut(step.formGroup.value)
      : step.formGroup.value;

    console.log('payload:--->', payload);
    const handler = step.save;

    if (!handler) {
      // no server save; mark complete locally
      this.setStepStatus(step.id, 'COMPLETED');
      return { local: true };
    }

    this.setStepStatus(step.id, 'ONGOING');
    this.loading$.next(true);
    try {
      const resp = await firstValueFrom(handler(payload, this.context));
      // step completed — parent might return ids (e.g., property_id)
      this.setStepStatus(step.id, 'COMPLETED');
      return resp;
    } catch (e) {
      this.setStepStatus(step.id, 'ERROR');
      throw e;
    } finally {
      this.loading$.next(false);
    }
  }

  async next() {
    const current = this.getCurrentIndex();
    // ensure current saved
    await this.saveStep(current);
    const nextIdx = Math.min(current + 1, this.steps.length - 1);
    this.currentIndex$.next(nextIdx);
    this.setStepStatus(this.steps[nextIdx].id, 'ONGOING');
  }

  prev() {
    const idx = Math.max(this.getCurrentIndex() - 1, 0);
    this.currentIndex$.next(idx);
    this.setStepStatus(this.steps[idx].id, 'ONGOING');
  }

  goTo(index: number) {
    if (index < 0 || index >= this.steps.length) return;
    const target = this.steps[index];
    const status = this.getStepStatus(target.id);
    if (status === 'LOCKED' || status === 'READY') return;
    this.currentIndex$.next(index);
  }

  markStepReady(index: number) {
    const step = this.getStep(index);
    if (!step) return;
    this.setStepStatus(step.id, 'READY');
  }

  reset() {
    for (const s of this.steps) {
      this.setStepStatus(s.id, 'LOCKED');
    }
    if (this.steps.length) {
      this.setStepStatus(this.steps[0].id, 'ONGOING');
      this.currentIndex$.next(0);
    }
    this.context = {};
  }
}
