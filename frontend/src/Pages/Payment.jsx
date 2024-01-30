import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import bca from "../img/bca.png";
import "../css/payment.css";
import { Navigate, useNavigate } from "react-router-dom";
import { removeOrderForPaid } from "../reducer/ActionsProduct";
import axios from "axios";

const Payment = ({ isAuthenticated, orderForPay, removeOrderForPaid }) => {
    // const showPaymentMidtrans = () => {
    //     window.snap.embed(localStorage.getItem("midtrans_token"), {
    //         embedId: 'snap-container'
    //       });
    // }
    // khusus set order
    // const [ dataOrder, setDataOrder ] = useState([]);
    const getDataOrder = async () => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": orderForPay });
        try {
            const res = await axios.post("http://localhost:8000/product/order/list/", body, config);
            await changeCartsToBought(res.data);
            // setDataOrder(res.data);
        } catch (error) {
            console.log(error)
        }
    };
    const changeStatusToPaymentVerified = async () => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": orderForPay });
        try {
            await axios.post("http://localhost:8000/product/order/payment-verified/", body, config);
        } catch (error) {
            console.log(error)
        }
    }
    const changeCartsToBought = async (dataOrder) => {
        let carts = [];
        for (let i=0; i<dataOrder.length; i++) {
            carts = carts.concat(dataOrder[i].order_items.map( n => n.cart))
        };
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": carts });
        try {
            await axios.post("http://localhost:8000/product/cart/action/set-bought/", body, config);
        } catch (error) {
            console.log(error)
        }
        
    }
    // const navigate = useNavigate();
    const handleHavePaid = async () => {
        await changeStatusToPaymentVerified();
        await getDataOrder();
        localStorage.removeItem('carts');
        localStorage.removeItem('products');
        localStorage.removeItem('address');
        removeOrderForPaid();
        // navigate("../order/customer/");
    }
    handleHavePaid();
    // useEffect( () => {
    //     getDataOrder();
    // }, [] );
    // const copyNumber = () => {
    //     const number = document.getElementById('account-number');
    //     navigator.clipboard.writeText(number.innerText)
    // }
    // if ( !isAuthenticated && !localStorage.getItem('access') ) {
    //     return <Navigate to={"../login/"}></Navigate>
    // };
    // if ( !orderForPay ) {
    //     return <Navigate to={"../checkout/"}></Navigate>
    // };
    return (
        <Navigate to={"../order/customer/"}></Navigate>
        // <div className="payment-main-box">
        //     <div id="snap-container"></div>
        //     <button onClick={showPaymentMidtrans} className="btn btn-primary">coba</button>
        //     <div className="payment-number-box">
        //         <div className="payment-logo">
        //             <img src={bca} alt="" />
        //             <h1>BCA</h1>
        //         </div>
        //         <div className="payment-number">
        //             <h5>No Virtual Account</h5>
        //             <h2 id="account-number">126 898776780</h2>
        //         </div>
        //         <button onClick={copyNumber} className="btn btn-sm btn-outline-primary btn-copy">copy</button>
        //     </div>
        //     <div className="instruction-payment-box">
        //         <div className="insntuction-payment">
        //             <h3>Cara transfer Virtual Account BCA via myBCA</h3>
        //             <ul>
        //                 <li>Buka myBCA</li>
        //                 <li>pilih menu “Transfer”</li>
        //                 <li>Pilih menu “Virtual Account”</li>
        //                 <li>Masukkan nomor BCA Virtual Account dan klik “Kirim”</li>
        //                 <li>Cek nominal yang muncul dan klik “Lanjut”</li>
        //                 <li>Konfirmasi detail transaksi dan klik “Lanjut”</li>
        //                 <li>Masukkan PIN myBCA Transaksi Berhasil</li>
        //             </ul>
        //         </div>
        //         <div className="insntuction-payment">
        //             <h3>Cara transfer Virtual Account BCA via ATM BCA</h3>
        //             <ul>
        //                 <li>Masukkan Kartu ATM dan PIN ATM BCA</li>
        //                 <li>Pilih menu “Penarikan Tunai/Transaksi Lainnya”</li>
        //                 <li>Pilih menu “Transaksi Lainnya”</li>
        //                 <li>Pilih menu “Transfer”</li>
        //                 <li>Pilih menu “Ke Rek BCA Virtual Account”</li>
        //                 <li>Masukkan nomor BCA Virtual Account dan klik “Benar”</li>
        //                 <li>Cek detail transaksi dan pilih “Ya” Transaksi selesai</li>
        //             </ul>
        //         </div>
        //         <div className="insntuction-payment">
        //             <h3>Cara transfer Virtual Account BCA via Klick BCA</h3>
        //             <ul>
        //                 <li>Login ke KlikBCA dan pilih menu “Transfer Dana”</li>
        //                 <li>Pilih menu “Transfer ke BCA Virtual Account”</li>
        //                 <li>Masukkan nomor BCA Virtual Account dan klik “Lanjutkan”</li>
        //                 <li>Masukkan respon KeyBCA Appli 1</li>
        //                 <li>klik “Kirim” Transaksi Berhasil</li>
        //             </ul>     
        //         </div>
        //     </div>
        //     <div className="d-grid gap-2 col-6 mx-auto">
        //         <button onClick={handleHavePaid} className="btn btn-primary" type="button">Have Paid</button>
        //     </div>
        // </div>
    )
};

const mapPropsToState = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated,
        orderForPay: state.ProductReducer.orderForPay
    }
};

export default connect(mapPropsToState, { removeOrderForPaid })(Payment);