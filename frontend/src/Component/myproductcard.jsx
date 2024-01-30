import React from "react";
import { useState } from "react";
import back from "../img/back.png";
import next from "../img/next.png";
import axios from "axios";
import ProductPictures from "./productPictures";

const MyProductCard = ({ data, sendData }) => {
    const [ index, setIndex ] = useState(0);
    const image = (data.pictures[index]) ? data.pictures[index].picture : null;
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
            if ( index < (data.pictures.length -1) ) {
                setIndex( index + 1 );
            }
        }
    };
    const handleEdit = () => {
        sendData(data);
    };
    const handleDelete = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.delete(`http://localhost:8000/product/mylist/action/${data.id}/`, config);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };
    // Product Pictures
    const [ productPictureClass, setProductPictureClass ] = useState("product-image-overlay d-none")
    const showProductPicture = () => setProductPictureClass("product-image-overlay");
    const hiddenProductPicture = () => setProductPictureClass("product-image-overlay d-none");
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
                <button onClick={showProductPicture} className="btn-sm btn-warning">Configure Picture</button>
            </div>
            <div className="card-body">
                <h5 className="card-title">{truncate(data.title, 40)}</h5>
                <p className="card-text">{truncate(data.description, 100)}</p>
            </div>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">Category : {data.category_name}</li>
                <li className="list-group-item"><small>Height : {data.height} cm | width : {data.width} cm | legtht : {data.length} cm</small></li>
                <li className="list-group-item">Weight : {data.weight} kg | Stock : {data.stock} pcs</li>
                <li className="list-group-item">Price : $ {data.price} | Sold : {data.sold} pcs</li>
                <li className="list-group-item">{data.address_detail ? <small>Address : {data.address_detail.address_name}, {data.address_detail.suburb}, {data.address_detail.city}, {data.address_detail.state}, {data.address_detail.country}</small> : <small>Address: Not Set</small>}</li>
            </ul>
            <div className="card-body">
                <button onClick={handleEdit} className="btn btn-sm btn-warning me-3">Edit</button>
                <button onClick={handleDelete} className="btn btn-sm btn-danger">Delete</button>
            </div>
            <div className={productPictureClass}>
                <button onClick={e => {hiddenProductPicture()}} type="button" className="btn-close" aria-label="Close"></button>
                < ProductPictures data_id={data.id} />
            </div>
        </div>
    )
}

export default MyProductCard;