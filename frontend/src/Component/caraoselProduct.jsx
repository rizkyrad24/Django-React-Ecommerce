import React from "react";

const CarouselProduct = ( props ) => {
    return (
        <div id="carouselExampleControls" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
            { props.data ? props.data.map( ( value, index ) => (
                    index > 0 ? (
                    <div className="carousel-item active" key={value.id}>
                        <img src={"http://localhost:8000" + value.picture} key={value.id} className="d-block w-100" alt={value.picture}/>
                    </div>
                    ) : (
                    <div className="carousel-item" key={value.id}>
                        <img src={"http://localhost:8000" + value.picture} key={value.id} className="d-block w-100" alt={value.picture}/>
                    </div>
                    )
                )) : <></> }
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    )
}

export default CarouselProduct;