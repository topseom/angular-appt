import { Action } from '@ngrx/store';

export const CHANGE_ORDERS = 'CHANGE_ORDER';

const DefaultOrdersList = {
    array:[],
    select:0
}

export function ordersReducer(state=DefaultOrdersList, action: Action) {
	switch (action.type) {
        case CHANGE_ORDERS:
            return {
                ...state,
                ...(action as any).orders
            };
        default:
			return state;
	}
}