import { Action } from '@ngrx/store';

export const CHANGE_NAVIGATION = 'CHANGE_NAVIGATION';

const DefaultNavigation = {
    page_view:"store",
    component:""
}

export function navigationReducer(state=DefaultNavigation, action: Action) {
	switch (action.type) {
        case CHANGE_NAVIGATION:
            return {
                ...state,
                ...(action as any).navigation
            };
        default:
			return state;
	}
}