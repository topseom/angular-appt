import { Action } from '@ngrx/store';

export const CHANGE_PRODUCT = 'CHANGE_PRODUCT';

const DefaultProducts = {
    product_list:[],
    temp:[],
    sort:undefined,
    category:undefined
}

export function productsReducer(state=DefaultProducts, action: Action) {
	switch (action.type) {
        case CHANGE_PRODUCT:
            return {
                ...state,
                ...(action as any).product
            };
        default:
			return state;
	}
}