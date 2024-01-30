import axios from "axios";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { cartNumberState } from "../reducer/ActionsProduct";

const CartProduct = ({ isAuthenticated, user, cartNumberState }) => {
    const [cartData, setCartData] = useState([]);
    const getCartList = async () => {
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                }
            }
            const res = await axios.get(`http://localhost:8000/product/cart/${user.pk}/`, config);
            setCartData(res.data);
        } catch (error) {
            console.log(error);
        }
    }
    const editCart = async (type, user, product, amountInput, stock, id) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        }
        if ( type === "plus" ) {
            if ( amountInput < stock ) {
                const amount = amountInput + 1;
                const body = JSON.stringify({ user, product, amount });
                try {
                    await axios.put(`http://localhost:8000/product/cart/action/${id}/`, body, config);
                    await getCartList();
                } catch (error) {
                    console.log(error);
                }
            }
        } else if ( type === "minus" ) {
            if ( amountInput > 0 ) {
                const amount = amountInput - 1;
                const body = JSON.stringify({ user, product, amount });
                try {
                    await axios.put(`http://localhost:8000/product/cart/action/${id}/`, body, config);
                    await getCartList();
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
    const multipleDeleteCart = async ( carts ) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": carts });
        console.log(body);
        try {
            await axios.post("http://localhost:8000/product/cart/action/multiple-delete/", body, config);
            getCartList();
            cartNumberState(user.pk);
        } catch (error) {
            console.log(error)
        }
    };
    const truncate = ( str, numberOfChar ) => {
        return str.length > numberOfChar? str.substring(0, (numberOfChar - 3)) + "...": str;
    }
    const navigate = useNavigate();
    const action = async () => {
        let checkboxes = document.querySelectorAll("input[name=cart-checkbox]:checked");
        let carts = [...checkboxes].map(checkbox => parseInt(checkbox.value));
        let products = [...checkboxes].map(checkbox => parseInt(checkbox.getAttribute('product_id')));
        let addresses = [...checkboxes].map(checkbox => parseInt(checkbox.getAttribute('address_id')));
        let action = document.getElementById("action");
        if ( action.value === "delete" ) {
            await multipleDeleteCart(carts);
        } else if ( action.value === "order" ) {
            localStorage.setItem('carts', carts);
            localStorage.setItem('products', products);
            localStorage.setItem('address', addresses);
            return navigate("../checkout/");
        }
    };
    useEffect( () => {
        if ( user ) {
            getCartList();
        }
    }, [user] );
    if ( !isAuthenticated && !localStorage.getItem('access') ) {
        return <Navigate to={"../login/"} />
    }
    return (
        <div className="container">
            <h1>Checkout Your Cart</h1>
            <div className="input-group action-cart">
                <select name="action" className="form-select" id="action" aria-label="Example select with button addon">
                    <option defaultValue>__Action__</option>
                    <option value="order">Order</option>
                    <option value="delete">Delete</option>
                </select>
                <button onClick={action} className="btn btn-primary" type="button">Go</button>
            </div>
            <table className="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Total Cost</th>
                    </tr>
                </thead>
                <tbody>
                    { cartData ? cartData.map( data => (
                        <tr key={data.id} className="cart-list">
                            <th scope="row"><input type="checkbox" value={data.id} product_id={data.product} address_id={data.products.address} name="cart-checkbox" /></th>
                            <td>
                                <div className="cart-product-field">
                                    { data.products.pictures[0] ? (
                                        <img className="cart-product-img" src={"http://localhost:8000" + data.products.pictures[0].picture} alt={data.products.pictures[0].picture} />
                                    ) : (
                                        <div className="no-image-cart"><p>No Image</p></div>
                                    ) }
                                    <span>{truncate(data.products.title, 200)}</span>
                                </div>
                            </td>
                            <td>$ {data.products.price}</td>
                            <td>
                                <div className="amount-actions">
                                    <button onClick={() => editCart("minus", user.pk, data.products.id, data.amount, data.products.stock, data.id)} type="button">-</button>
                                    <div>{data.amount}</div>
                                    <button onClick={() => editCart("plus", user.pk, data.products.id, data.amount, data.products.stock, data.id)} type="button">+</button>
                                </div>
                            </td>
                            <td>$ {(data.amount * data.products.price).toFixed(2)}</td>
                        </tr>
                    ) ) : (<></>) }
                </tbody>
            </table>
        </div>
    )
}

const mapPropsToState = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated,
        user: state.AuthReducer.user
    }
}

export default connect(mapPropsToState, { cartNumberState })(CartProduct);