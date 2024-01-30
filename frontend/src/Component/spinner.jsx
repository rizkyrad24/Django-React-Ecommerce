import React from "react";

const Spinner = ({ spinnerClass }) => {
    return (
        <div className={spinnerClass}>
            <div className="d-flex justify-content-center align-item-center spinner-box">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
};

export default Spinner;