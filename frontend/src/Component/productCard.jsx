import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ( props ) => {
    return (
        <div className="card mt-3" style={{width: "18rem"}}>
            { props.data.pictures[0] ? (
                <img src={props.data.pictures[0].picture} className="card-img-top" alt="..." />
            ) : (
                <div className="no-picture"><p>No Picture</p></div>
            )}
            <div className="card-body">
                <h5 className="card-title text-center"><Link className="text-decoration-none" to={"../detail/" + props.data.slug + "/"}>{props.data.title}</Link></h5>
                <h6 className="card-title text-center">Rp. {props.data.price}</h6>
                <p className="card-text text-center">{props.data.seller_name}</p>
                <p className="card-text text-center">Stock : {props.data.stock} left</p>
                <p className="card-text text-center">Terjual {props.data.sold}</p>
            </div>
        </div>
    )
}

export default ProductCard;