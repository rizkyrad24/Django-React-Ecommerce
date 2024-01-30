import React from "react";
import { connect } from "react-redux";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProductCard from "../Component/productCard";
import axios from "axios";
import queryString from "query-string";
import { verify, getUser } from "../reducer/Actions";

const Home = ({ isAuthenticated }) => {
    const location = useLocation();
    const values = queryString.parse(location.search);
    const { slug } = useParams();
    const [ product, setProduct ] = useState({
        dataProduct: [],
        article_amount: 0,
        next: null,
        previous: null,
        position: 1,
        pages: []
    });
    const setPossition = (inputUrl) => {
        if ( inputUrl ) {
            const text = "?" + (inputUrl.split("?")[1]);
            const values = queryString.parse(text);
            return parseInt(values.page)
        }
    };
    const [ url, setUrl ] = useState("http://localhost:8000/product/list/");
    const getArticle = async (url) => {
        const res = await axios.get(url);
        setProduct({
            ...product,
            dataProduct: res.data.results,
            article_amount: res.data.count,
            next: res.data.next,
            previous: res.data.previous,
            position: res.data.next != null ? (setPossition(res.data.next) - 1) : (res.data.previous != null ? (setPossition(res.data.previous) ? setPossition(res.data.previous) : 1) + 1 : parseInt(Math.ceil(res.data.count/5))),
            pages: [...Array(Math.ceil(res.data.count/5)).keys()].map( i => i + 1)
        })
    };
    const handleNext = () => {
        if ( product.next ) {
            getArticle(product.next);
        }
    };
    const handlePrevious = () => {
        if ( product.previous ) {
            getArticle(product.previous);
        }
    };
    const handleClickPage = async (url, page) => {
        if ( page > 1 ) {
            let address = url + `?page=${page}`;
            if ( values.keyword ) {
                address = url + `&page=${page}`
            };
            await getArticle(address); 
        } else {
            await getArticle(url);
        }
    }
    useEffect( () => {
        let address = "http://localhost:8000/product/list/";
        if ( slug ) {
            if ( slug !== "all" ) {
                address = `http://localhost:8000/product/list/category/${slug}/`
            };
        } else if ( values.keyword ) {
            address = "http://localhost:8000/product/list/search/?keyword=" + values.keyword;
        }
        setUrl(address);
        getArticle(address);
    }, [slug, isAuthenticated] )
    return (
        <div className="p-5 mb-4 bg-light rounded-3">
            <div className="container-fluid py-5">
                <h1 className="display-5 fw-bold">Welcome in mywebsite.co.id. Happy Shopping</h1>
                <div className="product-box">
                    {product.dataProduct.map(data => <ProductCard data={data} key={data.id}/>)}
                </div>
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
        </div>
    )
}

const mapStateToProps = ( state ) => (
    {
        isAuthenticated: state.AuthReducer.isAuthenticated
    }
)

export default connect(mapStateToProps, { verify, getUser })(Home);