import { PRODUCTTYPE } from "./Type";

const initialState = {
    cartNumber: 0,
    orderNumber: 0,
    orderForPay: localStorage.getItem('transaction_id') ? localStorage.getItem('transaction_id').split(",") : null
}

const ProductReducer = (state=initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case PRODUCTTYPE.ADD_CART_SUCCESS:
            return {
                ...state,
                cartNumber: payload
            }
        case PRODUCTTYPE.ADD_CART_FAIL:
            return {
                ...state,
                cartNumber: 0
            }
        case PRODUCTTYPE.ORDER_COUNT_SUCCESS:
            return {
                ...state,
                orderNumber: payload
            }
        case PRODUCTTYPE.ORDER_COUNT_FAIL:
            return {
                ...state,
                orderNumber: 0
            }
        case PRODUCTTYPE.ADD_ORDER:
            localStorage.setItem('transaction_id', payload);
            return {
                ...state,
                orderForPay: payload
            }
        case PRODUCTTYPE.REMOVE_ORDER:
            localStorage.removeItem('transaction_id')
            return {
                ...state,
                orderForPay: null
            }
        default:
            return state;
    }
}

export default ProductReducer;