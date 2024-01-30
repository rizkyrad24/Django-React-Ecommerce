import React from "react";
import { useState } from "react";
import axios from "axios";
import { Fragment } from "react";

const SellerOrderTable = ({ data, sendData, sendData2, refresh }) => {   
    const cancelOrder = async (transaction_id) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.delete(`http://localhost:8000/product/order/cancel/${transaction_id}/`, config);
        } catch (error) {
            console.log(error)
        }
    };
    const handleCancel = async (transaction_id) => {
        await cancelOrder(transaction_id);
        refresh();
    }
    const truncate = ( str, numberOfChar ) => {
        return str.length > numberOfChar? str.substring(0, (numberOfChar - 3)) + "...": str;
    };
    return (
            <tr className="cart-list">
                { data.status === "1" ? (
                    <th scope="row"><input type="checkbox" value={data.transaction_id} name="order-checkbox" /></th>
                ) : null }
                { data.status === "2" ? (
                    <th scope="row"><input type="checkbox" value={data.transaction_id} shipper_id={data.order_id_shipper} name="order-checkbox" /></th>
                ) : null }
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
                { data.status === "1" || data.status === "2" ? (
                    <button onClick={() => handleCancel(data.transaction_id)} className="btn btn-sm btn-danger mb-1">Cancel</button>
                ) : null}
                { data.order_id_shipper && data.status !== "4" ? (
                    <button onClick={() => sendData(data)} className="btn btn-sm btn-primary mb-1">Trace</button>
                ) : null}
                { data.status === "5" ? (
                    <button onClick={() => sendData2(data)} className="btn btn-sm btn-danger me-1">Complain</button>
                ) : null }
                </td>
            </tr>
    )
}

export default SellerOrderTable;