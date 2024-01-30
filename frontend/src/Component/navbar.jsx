import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../reducer/Actions";
import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import cartIcon from "../img/shooping_icon.png";
import orderIcon from "../img/lists.png";
import { useNavigate } from "react-router-dom";
import { cartNumberState, orderNumberState } from "../reducer/ActionsProduct";

const Navbar = ({ logout, isAuthenticated, user, cartNumber, cartNumberState, orderNumber, orderNumberState }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const values = location.search ? queryString.parse(location.search) : null;
    const keywordInput = values ? values.keyword : null;
    // const [cartNumber, setCartNumber] = useState(0)
    const [category, setCategory] = useState([]);
    const getCategory = async () => {
        const res = await axios.get("http://localhost:8000/product/category/");
        setCategory(res.data.results);
    };
    // const getCartList = async (input) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${localStorage.getItem('access')}`
    //             }
    //         }
    //         const res = await axios.get(`http://localhost:8000/product/cart/${input}/`, config);
    //         setCartNumber(res.data.length);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    useEffect( () => {
        getCategory();
        if ( user ) {
           cartNumberState(user.pk);
           orderNumberState();
        }
    }, [user, cartNumber] );
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-3 nav-edit edit">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Mywebsite.co.id</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                        </li>
                        <li className="nav-item active dropdown">
                            <Link className="nav-link active dropdown-toggle" to="/#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Category Product
                            </Link>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to="/category/all/">All Category</Link></li>
                                { category.map( data =>  <li key={data.id}><Link className="dropdown-item" to={"/category/" + data.slug + "/" } key={data.id}>{data.category}</Link></li> ) }
                            </ul>
                        </li>
                        { isAuthenticated? (
                            <li className="nav-item active dropdown">
                                <Link className="nav-link active dropdown-toggle" to="/#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    My Account
                                </Link>
                                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li>
                                    <Link className="dropdown-item" aria-current="page" to="myproducts/">My Product</Link>
                                    </li>
                                    <li>
                                    <Link className="dropdown-item" aria-current="page" to="order/seller/">My Product Order</Link>
                                    </li>
                                    { user ? (
                                        user.is_staff ? (
                                        <li>
                                        <Link className="dropdown-item" aria-current="page" to="order/complained/admin/">Solve Complained</Link>
                                        </li>
                                        ) : null
                                    ) : null }
                                    <li>
                                    <Link className="dropdown-item" aria-current="page" to="address/">My Address</Link>
                                    </li>
                                    <li>
                                    <Link className="dropdown-item" aria-current="page" to="change/password/">Change Password</Link>
                                    </li>
                                    <li>
                                    <span className="dropdown-item" aria-current="page" onClick={ logout } id="logout">Logout</span>
                                    </li>
                                </ul>
                            </li>
                        ): (
                            <>
                            <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to="login/">Login</Link>
                            </li>
                            <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to="signup/">Signup</Link>
                            </li>
                            </>
                        ) }
                    </ul>
                    <form className="d-flex" method="GET" action="/">
                        <input className="form-control me-2" name="keyword" defaultValue={keywordInput} type="search" placeholder="Search" aria-label="Search" />
                        <button className="btn btn-outline-light" type="submit">Search</button>
                    </form>
                    { isAuthenticated ? (
                        <>
                        <div className="cart-box">
                            <span className="order-amount">{cartNumber}</span>
                            <img className="cart-icon" onClick={() => navigate("../cart/")} src={cartIcon} alt="" />
                        </div>
                        <div className="cart-box">
                            <span className="order-amount">{orderNumber}</span>
                            <img className="cart-icon" onClick={() => navigate("../order/customer/")} src={orderIcon} alt="" />
                        </div>
                        </>
                    ) : <></> }
                </div>
            </div>
        </nav>
    )
}

const mapStateToProps = ( state ) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated,
        user: state.AuthReducer.user,
        cartNumber: state.ProductReducer.cartNumber,
        orderNumber: state.ProductReducer.orderNumber
    }
}

export default connect(mapStateToProps, { logout, cartNumberState, orderNumberState })(Navbar)