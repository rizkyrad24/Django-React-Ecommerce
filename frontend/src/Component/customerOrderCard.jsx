import React, { Fragment } from "react";
import { useState } from "react";
import back from "../img/back.png";
import next from "../img/next.png";
import axios from "axios";

const CustomerOrderCard = ({ data, sendData, sendData2, refresh }) => {
    const [ index, setIndex ] = useState(0);
    const image = (data.order_items[index]) ? data.order_items[index].cart_detail.products.pictures[0].picture : null;
    const title = (data.order_items[index]) ? data.order_items[index].cart_detail.products.title : null;
    const amount = (data.order_items[index]) ? data.order_items[index].cart_detail.amount : null;
    const truncate = ( str, numberOfChar ) => {
        return str.length > numberOfChar? str.substring(0, (numberOfChar - 3)) + "...": str;
    };
    const handleBack = () => {
        if ( image ) {
            if ( index > 0 ) {
                setIndex( index - 1 );
            }
        }
    }
    const handleNext = () => {
        if ( image ) {
            if ( index < (data.order_items.length -1) ) {
                setIndex( index + 1 );
            }
        }
    };
    // delivering fase
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
        } catch (error) {
            console.log(error)
        }
    };
    const handleComplete = async (transaction_id) => {
        await moveToComplete(transaction_id);
        await refresh();
    };
    return (
        <div className="card" style={{width: 20 + "rem"}}>
            <div className="image-slide">
                <div className="img-box-product">
                    { image ? (
                        <img src={image} className="img-product" alt="..."/>
                    ) : (
                        <div className="no-image"><p>No Image</p></div>
                    ) }
                </div>
                <div className="arrow-layout">
                    <img onClick={handleBack} src={back} alt="" className="img-arrow left" />
                    <img onClick={handleNext} src={next} alt="" className="img-arrow right" />
                </div>
            </div>
            <div className="card-body">
                <h5 className="card-title">{truncate(title, 40)}</h5>
            </div>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">amount : {amount} pcs</li>
                <li className="list-group-item">Transaction ID : {data.transaction_id}</li>
                <li className="list-group-item">Courir : {data.courir}</li>
                <li className="list-group-item">{data.destination_detail ? <small>Destination : {data.destination_detail.address_name}, {data.destination_detail.suburb}, {data.destination_detail.city}, {data.destination_detail.state}, {data.destination_detail.country}</small> : <small>Destination: Not Set</small>}</li>
            </ul>
            <div className="card-body">
                { data.order_id_shipper && data.status !== "4" ? (
                <button onClick={() => sendData(data)} className="btn btn-sm btn-warning me-1">Trace</button>
                ) : null }
                { data.status === "5" || data.status === "3" ? (
                <Fragment>
                    <button onClick={() => handleComplete(data.transaction_id)} className="btn btn-sm btn-primary me-1">Complete Order</button>
                    <button onClick={() => sendData2(data)} className="btn btn-sm btn-danger me-1">Complain</button>
                </Fragment>
                ) : null }
            </div>
        </div>
    )
}

export default CustomerOrderCard;