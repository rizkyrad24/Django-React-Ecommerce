import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Navigate } from "react-router-dom";
import "../css/orderseller.css";
import SellerOrderTable from "../Component/sellerOrderTable";
import Spinner from "../Component/spinner";

const OrderClient = ({ isAuthenticated, user }) => {
    const [ orderList, setOrderList ] = useState([]);
    const [ amount, setAmount ] = useState([]);
    const getOrderList = async () => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get("http://localhost:8000/product/order/list/seller/", config);
            setOrderList(res.data.results);
            setAmount(res.data.results.map( item => item.status));
        } catch (error) {
            console.log(error)
        }
    };
    // Payment Verified fase
    const createOrderShipper = async (carts) => {
        for ( let i=0; i<carts.length; i++ ) {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                }
            };
            const body = JSON.stringify({ "data": carts[i] })
            try {
                await axios.post("http://localhost:8000/product/order-item/multiple/backend-process/", body, config);
            } catch (error) {
                console.log(error)
            }
        }
    };
    const orderToProcess = async (carts) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": carts })
        try {
            await axios.post("http://localhost:8000/product/order/processing/", body, config);
            await getOrderList();
        } catch (error) {
            console.log(error)
        }
    };
    const actionPaymentVerified = async (e) => {
        const type = e.target.previousElementSibling.value
        if ( type === "process" ) {
            const table = e.target.parentElement.nextElementSibling
            const checkboxes = table.querySelectorAll("input[name=order-checkbox]:checked")
            let carts = [...checkboxes].map(checkbox => checkbox.value);
            await createOrderShipper(carts);
            await orderToProcess(carts);
        }
    };
    // Processing Fase
    const requestPickup = async (shipper_id) => {
        const data = {
            "order_activation": {
                "order_id": shipper_id
            }
        };
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ data });
        try {
            await axios.post("http://localhost:8000/product/pickup/shipping/", body, config);
        } catch (error) {
            console.log(error)
        }
    };
    const orderToDelivering = async (carts) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": carts })
        try {
            await axios.post("http://localhost:8000/product/order/delivering/", body, config);
            await getOrderList();
        } catch (error) {
            console.log(error)
        }
    };
    const actionProcessing = async (e) => {
        const type = e.target.previousElementSibling.value
        if ( type === "send" ) {
            const table = e.target.parentElement.nextElementSibling
            const checkboxes = table.querySelectorAll("input[name=order-checkbox]:checked")
            let shipper_id = [...checkboxes].map(checkbox => checkbox.getAttribute('shipper_id'));
            let carts = [...checkboxes].map(checkbox => checkbox.value);
            await requestPickup(shipper_id);
            await orderToDelivering(carts);
        }
    };
    // trackings
    const [ overlayClass, setOverLayClass ] = useState("overlay-trackings d-none");
    const showTrackings = () => setOverLayClass("overlay-trackings");
    const hideTrackings = () => setOverLayClass("overlay-trackings d-none");
    const [ dataDetail, setDataDetail ] = useState(null);
    const getData = async (dataOrder) => {
        showSpinner();
        await getTraceData(dataOrder.order_id_shipper);
        setDataDetail(dataOrder);
        hideSpinner();
        showTrackings();
    };
    const [ traceData, setTraceData ] = useState([]);
    const getTraceData = async (shipper_id) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/check/shipping/${shipper_id}/`, config);
            setTraceData(res.data.trackings);
        } catch (error) {
            console.log(error)
        }
    };
    // complaining
    const [ overlayComplainClass, setOverLayComplainClass ] = useState("overlay-complain d-none");
    const showComplain = () => setOverLayComplainClass("overlay-complain");
    const hideComplain = async () => {
        await getOrderList();
        setOverLayComplainClass("overlay-complain d-none");
    };
    const [ dataDetailComplain, setDataDetailComplain ] = useState(null);
    const moveToComplained = async (transaction_id) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": transaction_id });
        try {
            await axios.post("http://localhost:8000/product/order/complained/", body, config);
        } catch (error) {
            console.log(error)
        }
    };
    const [ complainList, setComplainList ] = useState([])
    const getComplainList = async (complain_id) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/complain/list/${complain_id}/`, config);
            setComplainList(res.data);
        } catch (error) {
            console.log(error);
        }
    }
    const addComplain = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.post("http://localhost:8000/product/complain/add/", formData, config);
            await getComplainList(dataDetailComplain.id);
        } catch (error) {
            console.log(error);
        }
    };
    const deleteComplain = async (id) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.delete(`http://localhost:8000/product/complain/delete/${id}/`, config);
            await getComplainList(dataDetailComplain.id);
        } catch (error) {
            console.log(error);
        }
    }
    const submitComplain = async (e, transaction_id, order_id) => {
        e.preventDefault();
        let new_form = new FormData(e.target)
        new_form.append("order_id", order_id);
        await addComplain(new_form);
        const test = document.getElementById("text");
        test.value = null;
        const formFile = document.getElementById("formFile");
        formFile.value = null;
        await moveToComplained(transaction_id);
    };
    const getDataForComplain = async (dataOrder) => {
        showSpinner();
        await getComplainList(dataOrder.id);
        await setDataDetailComplain(dataOrder);
        hideSpinner();
        showComplain();
    };
    // picture click
    const pictureClick = (link) => {
        window.open(link)
    };
    // spinner
    const [ overlaySpinnerClass, setOverLaySpinnerClass ] = useState("overlay-spinner d-none");
    const showSpinner = () => setOverLaySpinnerClass("overlay-spinner");
    const hideSpinner = () => setOverLaySpinnerClass("overlay-spinner d-none");
    useEffect( () => {
        getOrderList();
    }, [] );
    if ( !isAuthenticated && !localStorage.getItem('access') ) {
        return <Navigate to={"../login/"}></Navigate>
    };
    return (
        <div className="container order-client-box">
            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li className="nav-item me-3" role="presentation">
                    <button className="nav-link active position-relative" id="pills-0-tab" data-bs-toggle="pill" data-bs-target="#pills-0" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
                        Hasn't Paid
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {amount.filter(item => item === "0").length}
                            <span className="visually-hidden">amount order</span>
                        </span>
                    </button>
                </li>
                <li className="nav-item me-3" role="presentation">
                    <button className="nav-link position-relative" id="pills-1-tab" data-bs-toggle="pill" data-bs-target="#pills-1" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
                        Payment Verified
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {amount.filter(item => item === "1").length}
                            <span className="visually-hidden">amount order</span>
                        </span>
                    </button>
                </li>
                <li className="nav-item me-3" role="presentation">
                    <button className="nav-link position-relative" id="pills-2-tab" data-bs-toggle="pill" data-bs-target="#pills-2" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
                        Processing
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {amount.filter(item => item === "2").length}
                            <span className="visually-hidden">amount order</span>
                        </span>
                    </button>
                </li>
                <li className="nav-item me-3" role="presentation">
                    <button className="nav-link position-relative" id="pills-3-tab" data-bs-toggle="pill" data-bs-target="#pills-3" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
                        Delivering
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {amount.filter(item => item === "3").length}
                            <span className="visually-hidden">amount order</span>
                        </span>
                    </button>
                </li>
                <li className="nav-item me-3" role="presentation">
                    <button className="nav-link position-relative" id="pills-4-tab" data-bs-toggle="pill" data-bs-target="#pills-4" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">
                        Complete
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {amount.filter(item => item === "4").length}
                            <span className="visually-hidden">amount order</span>
                        </span>
                    </button>
                </li>
                <li className="nav-item me-3" role="presentation">
                    <button className="nav-link position-relative" id="pills-5-tab" data-bs-toggle="pill" data-bs-target="#pills-5" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">
                        Complained
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {amount.filter(item => item === "5").length}
                            <span className="visually-hidden">amount order</span>
                        </span>
                    </button>
                </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
                <div className="tab-pane fade show active" id="pills-0" role="tabpanel" aria-labelledby="pills-home-tab">
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Origin</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Courir</th>
                            <th scope="col">Transaction Id</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orderList? orderList.map( item => (
                                item.status === "0" ? < SellerOrderTable key={item.id} data={item}/> : null
                            ) ) : null }
                        </tbody>
                    </table>
                </div>
                <div className="tab-pane fade" id="pills-1" role="tabpanel" aria-labelledby="pills-profile-tab">
                    <div className="input-group action-cart">
                        <select name="action" className="form-select" id="action" aria-label="Example select with button addon">
                            <option defaultValue>__Action__</option>
                            <option value="process">Process</option>
                        </select>
                        <button onClick={e => actionPaymentVerified(e)} className="btn btn-primary" type="button" id="test">Go</button>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Product</th>
                            <th scope="col">Origin</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Courir</th>
                            <th scope="col">Transaction Id</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orderList? orderList.map( item => (
                                item.status === "1" ? < SellerOrderTable key={item.id} data={item} refresh={getOrderList}/> : null
                            ) ) : null }
                        </tbody>
                    </table>
                </div>
                <div className="tab-pane fade" id="pills-2" role="tabpanel" aria-labelledby="pills-contact-tab">
                    <div className="input-group action-cart">
                        <select name="action" className="form-select" id="action" aria-label="Example select with button addon">
                            <option defaultValue>__Action__</option>
                            <option value="send">Request Pickup</option>
                        </select>
                        <button onClick={e => actionProcessing(e)} className="btn btn-primary" type="button">Go</button>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">#</th>
                            <th scope="col">Product</th>
                            <th scope="col">Origin</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Courir</th>
                            <th scope="col">Transaction Id</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orderList? orderList.map( item => (
                                item.status === "2" ? < SellerOrderTable key={item.id} data={item} sendData={getData} refresh={getOrderList}/> : null
                            ) ) : null }
                        </tbody>
                    </table>
                </div>
                <div className="tab-pane fade" id="pills-3" role="tabpanel" aria-labelledby="pills-contact-tab">
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Origin</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Courir</th>
                            <th scope="col">Transaction Id</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orderList? orderList.map( item => (
                                item.status === "3" ? < SellerOrderTable key={item.id} data={item} sendData={getData} refresh={getOrderList}/> : null
                            ) ) : null }
                        </tbody>
                    </table>
                </div>
                <div className="tab-pane fade" id="pills-4" role="tabpanel" aria-labelledby="pills-contact-tab">
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Origin</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Courir</th>
                            <th scope="col">Transaction Id</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orderList? orderList.map( item => (
                                item.status === "4" ? < SellerOrderTable key={item.id} data={item} sendData={getData}/> : null
                            ) ) : null }
                        </tbody>
                    </table>
                </div>
                <div className="tab-pane fade" id="pills-5" role="tabpanel" aria-labelledby="pills-contact-tab">
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Origin</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Courir</th>
                            <th scope="col">Transaction Id</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orderList? orderList.map( item => (
                                item.status === "5" ? < SellerOrderTable key={item.id} data={item} sendData={getData} sendData2={getDataForComplain}/> : null
                            ) ) : null }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={overlayClass}>
                <div className="tracking-box">
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-1">
                        <button onClick={hideTrackings} type="button" className="btn-close" aria-label="Close"></button>
                    </div>
                    { dataDetail ? (
                    <Fragment>
                        <h3>Transaction Id : {dataDetail.transaction_id}</h3>
                        <h5>Courier : {dataDetail.courir}</h5>
                        <ul>
                            { traceData.map( (item, counter) => <li key={counter}>{item.shipper_status.description}</li> ) }
                        </ul>
                    </Fragment>
                    ) : null }
                </div>
            </div>
            <div className={overlayComplainClass}>
                <div className="tracking-box">
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-1">
                        <button onClick={hideComplain} type="button" className="btn-close" aria-label="Close"></button>
                    </div>
                    { dataDetailComplain ? (
                    <Fragment>
                        <h1>Complain Form</h1>
                        <h3>Transaction Id : {dataDetailComplain.transaction_id}</h3>
                        <h5>Courier : {dataDetailComplain.courir}</h5>
                        { complainList ? complainList.map(item => (
                            <div className="complain-box" key={item.id}>
                                <div className="complain-header-box">
                                    <span>{item.sender_name}</span>
                                    <span className="date-upload">{item.uploaded}</span>
                                </div>
                                <p>{item.text}</p>
                                <div className="complain-picture-box">
                                    { item.complain_pictures.map( pict => (
                                        <img onClick={() => pictureClick(("http://localhost:8000" + pict.picture))} src={"http://localhost:8000" + pict.picture} alt="" key={pict.id}/>
                                    ) ) }
                                </div>
                                { item.sender === user.pk ? (
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button onClick={() => deleteComplain(item.id)} className="btn btn-danger btn-sm me-md-2" type="button">delete</button>
                                </div>
                                ) : null }
                            </div>
                        ) ) : null }
                        <form onSubmit={ e => {submitComplain(e, dataDetailComplain.transaction_id, dataDetailComplain.id);} } className="mt-3" encType="multipart/form-data">
                            <div className="mb-3">
                                <textarea name="text" id="text" className="form-control" rows="3" placeholder="Explain your complain here"></textarea>
                                <input accept="image/*" multiple name="pictures" className="form-control" type="file" id="formFile"/>
                            </div>
                            <div className="d-grid gap-2 col-6 mx-auto">
                                <button className="btn btn-primary" type="submit">Submit Complain</button>
                            </div>
                        </form>
                        
                    </Fragment>
                    ) : null }
                </div>
            </div>
            <Spinner spinnerClass={overlaySpinnerClass}/>
        </div>
    )
}

const mapPropsToState = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated,
        user: state.AuthReducer.user
    }
};

export default connect(mapPropsToState)(OrderClient);