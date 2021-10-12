import BugsnagServiceResolver from "./types/BugsnagServiceResolver";
import { Event } from '@bugsnag/js';

export interface UniversalBugsnagStatic {
	registerCallback(callback: (event: Event) => void): void;
}

export { BugsnagServiceResolver };