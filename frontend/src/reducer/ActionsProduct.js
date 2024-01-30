import { PRODUCTTYPE } from "./Type";
import axios from "axios";
axios.defaults.withCredentials = true

export const cartNumberState = (user) => async dispatch => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access')}`
        }
    };
    try {
        const res = await axios.get(`http://localhost:8000/product/cart/${user}/`, config);
        dispatch ({
            type: PRODUCTTYPE.ADD_CART_SUCCESS,
            payload: res.data.length
        });
    } catch (error) {
        dispatch ({
            type: PRODUCTTYPE.ADD_CART_FAIL
        });
    }
}


export const orderNumberState = () => async dispatch => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access')}`
        }
    };
    try {
        const res = await axios.get(`http://localhost:8000/product/order/list/customer/count/`, config);
        dispatch ({
            type: PRODUCTTYPE.ORDER_COUNT_SUCCESS,
            payload: res.data.amount_order
        });
    } catch (error) {
        dispatch ({
            type: PRODUCTTYPE.ORDER_COUNT_FAIL
        });
    }
}

export const addOrderForPaid = (data) => dispatch => {
    dispatch({
        type: PRODUCTTYPE.ADD_ORDER,
        payload: data
    })
}

export const removeOrderForPaid = () => dispatch => {
    dispatch({
        type: PRODUCTTYPE.REMOVE_ORDER
    })
}

