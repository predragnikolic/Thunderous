import type { RenderOptions } from './types';

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
	formAssociated: false,
	observedAttributes: [],
	props: [],
	attachShadow: true,
	shadowRootOptions: {
		mode: 'closed',
		delegatesFocus: false,
		clonable: false,
		serializable: false,
		slotAssignment: 'named',
	},
};
