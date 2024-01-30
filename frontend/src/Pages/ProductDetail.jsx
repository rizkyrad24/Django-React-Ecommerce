import React from "react";
import CarouselProduct from "../Component/caraoselProduct";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { cartNumberState } from "../reducer/ActionsProduct";

const ProductDetail = ({ user, cartNumberState }) => {
    const [ dataProduct, setDataProduct ] = useState({})
    const { slug } = useParams();
    const getProduct = async () => {
        const res = await axios.get(`http://localhost:8000/product/detail/${slug}/`);
        setDataProduct(res.data);
    }
    const [ amountOrder, setAmountOrder ] = useState(0)
    const handlePlus = () => {
        if ( amountOrder < dataProduct.stock ) {
            setAmountOrder(amountOrder + 1);
        }
    };
    const handleMinus = () => {
        if ( amountOrder >=1 ) {
            setAmountOrder(amountOrder -1);
        }
    }
    const navigate = useNavigate();
    const addToCart = async () => {
        if ( amountOrder >= 1 && amountOrder <= dataProduct.stock && dataProduct.seller !== user.pk ) {
            if ( user ) {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${ localStorage.getItem('access') }`
                    }
                };
                const body = JSON.stringify({"user": user.pk, "product": dataProduct.id, "amount": amountOrder});
                try {
                    await axios.post("http://localhost:8000/product/add/cart/", body, config);
                    await cartNumberState(user.pk)
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (error) {
                    console.log(error)
                }
            } else {
                return navigate("../login/");
            }
        }
    }
    useEffect( () => {
        getProduct();
    }, [] )
    return (
        <div className="product-detail-box">
            { dataProduct.pictures ? (
                < CarouselProduct data={dataProduct.pictures} />
            ) : (
                <div className="no-picture carousel"><p>No Picture</p></div>
            ) }
            <div className="product-detail-info">
                <h3 className="">{dataProduct.title}</h3>
                <h4>Category : {dataProduct.category_name}</h4>
                <h4>Seller : {dataProduct.seller_name}</h4>
                <h4>Stock : {dataProduct.stock} unit</h4>
                <h4>sold : {dataProduct.category_name} unit</h4>
                <h3 className="mt-4">Price ${dataProduct.price}</h3>
            </div>
            <div className="description">
                <pre className="des-text">{dataProduct.description}</pre>
            </div>
            <div className="order-box">
                <button onClick={handleMinus} className="order-button" type="button">-</button>
                <div className="total-order">{amountOrder}</div>
                <button onClick={handlePlus} className="order-button" type="button">+</button>
            </div>
            <div className="d-grid gap-2 col-6 mx-auto btn-add-to-chart">
                <button onClick={addToCart} className="btn btn-primary" type="button">Add to Cart</button>
            </div>
        </div>
    )
}

const mapPropsToState = (state) => {
    return {
        user: state.AuthReducer.user
    }
}

export default connect(mapPropsToState, { cartNumberState })(ProductDetail);