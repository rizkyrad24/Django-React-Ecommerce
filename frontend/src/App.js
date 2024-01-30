import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChangePassword from "./Pages/ChangePassword";
import EmailVerification from "./Pages/EmailVerification";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import ResetPassword from "./Pages/ResetPassword";
import ResetPasswordConfirm from "./Pages/ResetPasswordConfirm";
import Signup from "./Pages/Signup";
import ProductDetail from "./Pages/ProductDetail";
import CartProduct from "./Pages/CartProduct";
import Layout from "./High Order Function/Layout";
import CheckoutProduct from "./Pages/CheckoutProduct";
import MyAddress from "./Pages/MyAddress";
import MyProducts from "./Pages/MyProducts";
import Payment from "./Pages/Payment";
import OrderClient from "./Pages/OrderClient";
import OrderSeller from "./Pages/OrderSeller";
import SolveComplainAdmin from "./Pages/SolveComplainAdmin";
import "./css/main.css";
import "./css/product.css";
import { Provider } from "react-redux";
import Store from "./Store";

const App = () => {
  return (
    <Provider store={Store}>
      <Router>
        <Layout>
          <Routes>
            <Route exact path="/" Component={Home}></Route>
            <Route path="login/" Component={Login}></Route>
            <Route path="signup/" Component={Signup}></Route>
            <Route path="change/password/" Component={ChangePassword}></Route>
            <Route path="reset/password/" Component={ResetPassword}></Route>
            <Route path="dj-rest-auth/registration/account-confirm-email/:key/" Component={EmailVerification}></Route>
            <Route path="reset/password/confirm/:uid/:token" Component={ResetPasswordConfirm}></Route>
            <Route path="category/:slug/" Component={Home}></Route>
            <Route path="detail/:slug/" Component={ProductDetail}></Route>
            <Route path="cart/" Component={CartProduct}></Route>
            <Route path="checkout/" Component={CheckoutProduct}></Route>
            <Route path="address/" Component={MyAddress}></Route>
            <Route path="myproducts/" Component={MyProducts}></Route>
            <Route path="payment/" Component={Payment}></Route>
            <Route path="order/customer/" Component={OrderClient}></Route>
            <Route path="order/seller/" Component={OrderSeller}></Route>
            <Route path="order/complained/admin/" Component={SolveComplainAdmin}></Route>
          </Routes>
        </Layout>
      </Router>
    </Provider>
  )
}

export default App