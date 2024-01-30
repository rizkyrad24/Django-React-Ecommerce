import React from "react";
import { useState, useEffect, Fragment } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/orderseller.css";
import { connect } from "react-redux";
import Spinner from "../Component/spinner";

const SolveComplainAdmin = ({ isAuthenticated, user }) => {
    const [ orderData, setOrderData ] = useState([])
    const getOrderList = async () => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get("http://localhost:8000/product/order/list/complained/admin/", config);
            setOrderData(res.data.results);
        } catch (error) {
            console.log(error)
        }
    };
    const navigate = useNavigate();
    const truncate = ( str, numberOfChar ) => {
        return str.length > numberOfChar? str.substring(0, (numberOfChar - 3)) + "...": str;
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
    // complete complain
    const moveToComplete = async (transaction_id) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ "data": transaction_id });
        try {
            await axios.post("http://localhost:8000/product/order/complete/", body, config);
            getOrderList();
        } catch (error) {
            console.log(error)
        }
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
        if (user) {
            if (!user.is_staff) {
                navigate("../login/");
            };
        };
        getOrderList();
    }, [user] );
    if ( !isAuthenticated && !localStorage.getItem('access') ) {
        return <Navigate to={"../login/"}></Navigate>
    };
    return (
        <div className="container">
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
                    { orderData ? orderData.map( data => (
                        <tr className="cart-list" key={data.id}>
                            <td>
                                <div>
                                    { data.order_items ? data.order_items.map( item => (
                                        <div className="order-seller-field" key={item.id}>
                                            <div className="order-seller-img">
                                                <img src={item.cart_detail.products.pictures[0].picture} alt="" />
                                            </div>
                                            <span>{truncate(item.cart_detail.products.title, 50)}</span>
                                            <span>{item.cart_detail.amount} pcs</span>
                                        </div>
                                    ) ) : null }
                                </div>
                            </td>
                            <td>{data.origin_detail.address_name}, {data.origin_detail.suburb}, {data.origin_detail.city}, {data.origin_detail.state}, {data.origin_detail.country}</td>
                            <td>{data.destination_detail.address_name}, {data.destination_detail.suburb}, {data.destination_detail.city}, {data.destination_detail.state}, {data.destination_detail.country}</td>
                            <td>{data.courir}</td>
                            <td>{data.transaction_id}</td>
                            <td className="action-button">
                                <button onClick={() => getData(data)} className="btn btn-sm btn-primary mb-1">Trace</button>
                                <button onClick={() => getDataForComplain(data)} className="btn btn-sm btn-danger mb-1">Complain</button>
                                <button onClick={() => moveToComplete(data.transaction_id)} className="btn btn-sm btn-warning">Complete</button>
                            </td>
                        </tr>
                    ) ) : null }
                </tbody>
            </table>
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
    );
};

const mapPropsToState = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated,
        user: state.AuthReducer.user
    }
};

export default connect(mapPropsToState)(SolveComplainAdmin);