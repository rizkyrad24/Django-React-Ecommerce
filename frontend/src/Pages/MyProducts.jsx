import React from "react";
import { useState, useEffect } from "react";
import "../css/myproducts.css"
import MyProductCard from "../Component/myproductcard";
import axios from "axios";
import queryString from "query-string";
import FormAddProduct from "../Component/formAddProduct";
import FormEditProduct from "../Component/formEditProduct";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";

const MyProducts = ({ isAuthenticated }) => {
    const [ product, setProduct ] = useState({
        dataProduct: [],
        article_amount: 0,
        next: null,
        previous: null,
        position: 1,
        pages: []
    });
    // pagination
    const setPossition = (inputUrl) => {
        if ( inputUrl ) {
            const text = "?" + (inputUrl.split("?")[1]);
            const values = queryString.parse(text);
            return parseInt(values.page)
        }
    };
    const url = "http://localhost:8000/product/mylist/";
    const getProductList = async (url) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(url, config);
            setProduct({
                ...product,
                dataProduct: res.data.results,
                article_amount: res.data.count,
                next: res.data.next,
                previous: res.data.previous,
                position: res.data.next != null ? (setPossition(res.data.next) - 1) : (res.data.previous != null ? (setPossition(res.data.previous) ? setPossition(res.data.previous) : 1) + 1 : parseInt(Math.ceil(res.data.count/5))),
                pages: [...Array(Math.ceil(res.data.count/5)).keys()].map( i => i + 1)
            })
        } catch (error) {
            console.log(error);
        }
    };
    const handleNext = () => {
        if ( product.next ) {
            getProductList(product.next);
        }
    };
    const handlePrevious = () => {
        if ( product.previous ) {
            getProductList(product.previous);
        }
    };
    const handleClickPage = async (url, page) => {
        if ( page > 1 ) {
            let address = url + `?page=${page}`;
            await getProductList(address); 
        } else {
            await getProductList(url);
        }
    };
    // Product choosen
    const [ productPicked, setProductPicked ] = useState(null);
    const pickProduct = (data) => setProductPicked(data);
    const getData = (data) => {
        pickProduct(data);
        showFormProduct();
    }
    // form product
    const [ formProduct, setFormProduct ] = useState("overlay-product d-none")
    const showFormProduct = () => setFormProduct("overlay-product");
    const hiddenFormProduct = () => setFormProduct("overlay-product d-none");
    // refresh product
    useEffect( () => {
        getProductList(url);
    }, [] )
    if ( !isAuthenticated && !localStorage.getItem('access') ) {
        return <Navigate to={"../login"}></Navigate>
    }
    return (
        <div className="container">
            <h1>My Products</h1>
            <div className="header-info mb-1">
                <h5>Total : {} product</h5> 
                <button onClick={showFormProduct} className="btn btn-sm btn-primary">Add Product</button>
            </div>
            <div className="myproducts-box">
                { product ? product.dataProduct.map( item => < MyProductCard data={item} sendData={getData} key={item.id}/> ) : <></> }
            </div>
            <nav aria-label="..." className="mt-4">
                <ul className="pagination justify-content-center">
                    <li className="page-item">
                    <button className="page-link" onClick={handlePrevious}>Previous</button>
                    </li>
                    { product.pages.map( data => data === product.position ? (
                        <li className="page-item active" key={data} aria-current="page">
                        <button className="page-link" key={data} onClick={()=> handleClickPage(url, parseInt(data))}>{data}</button>
                        </li>
                    ):(
                        <li className="page-item" key={data} aria-current="page">
                        <button className="page-link" key={data} onClick={()=> handleClickPage(url, parseInt(data))}>{data}</button>
                        </li>
                    ) ) }
                    <li className="page-item">
                    <button className="page-link" onClick={handleNext}>Next</button>
                    </li>
                </ul>
            </nav>
            <div className={formProduct}>
                <div className="form-product-box">
                    <button onClick={e => {hiddenFormProduct()}} type="button" className="btn-close" aria-label="Close"></button>
                    { productPicked ? <FormEditProduct data={productPicked}/> : <FormAddProduct /> }
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated
    }
};

export default connect(mapStateToProps)(MyProducts);