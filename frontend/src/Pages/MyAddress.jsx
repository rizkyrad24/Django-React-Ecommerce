import React from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import "../css/formaddress.css";
import FormAddAddress from "../Component/formAddAddress";
import FormEditAddress from "../Component/formEditAddress";
import { Navigate } from "react-router-dom";

const MyAddress = ({ isAuthenticated }) => {
    const [ addressList, setAddressList ] = useState([])
    const getAddressList = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get("http://localhost:8000/product/shipping/address/", config);
            setAddressList(res.data.results);
        } catch (error) {
            console.log(error);
        }
    }
    const deleteAddress = async (address_id) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.delete(`http://localhost:8000/product/shipping/address/action/${address_id}/`, config);
            getAddressList();
        } catch (error) {
            console.log(error);
        }
    };
    const [ addressPicked, setAddressPicked ] = useState({})
    const handleEditButton = (data) => {
        setAddressPicked(data);
    }
    const resetAddress = () => {
        setAddressPicked({});
    }
    const [ formAddress, setFormAddress ] = useState("overlay d-none")
    const showFormAddress = () => setFormAddress("overlay");
    const hiddenFormAddress = () => setFormAddress("overlay d-none");
    const getData = async () => {
        await getAddressList();
        hiddenFormAddress();
    };
    useEffect( () => {
        getAddressList();
    }, [] );
    if ( !isAuthenticated && !localStorage.getItem('access') ) {
        return <Navigate to={"../login"}></Navigate>
    }
    return (
        <div className="container">
            <div className="row">
                <div className="address-main-box">
                    <h1 className="text-center">Address List</h1>
                    <div className="header-info-address mb-1">
                        <h5>Total : {addressList.length} addresses</h5> 
                        <button onClick={e => {resetAddress(); showFormAddress()}} className="btn btn-sm btn-primary">Add Address</button>
                    </div>
                    <div className="address-list">
                    { addressList ? addressList.map( data => (
                        <div key={data.id} className="address-box mb-4">
                            <h3>{data.address_name}</h3>
                            <p>Name : {data.name}</p>
                            <p>Phone : {data.phone}</p>
                            <p id="lat">Latitude : {data.latitude}</p>
                            <p id="long">Longlitude: {data.longlitude}</p>
                            <p>Address Detail : {data.detail_address}</p>
                            <p>Area/Kelurahan : {data.area}</p>
                            <p>Suburb : {data.suburb}</p>
                            <p>City : {data.city}</p>
                            <p>State : {data.state}</p>
                            <p>Country : {data.country}</p>
                            <button onClick={() => {handleEditButton(data); showFormAddress()}} className="btn-sm btn-warning me-2">Edit</button>
                            <button onClick={() => deleteAddress(data.id)} className="btn-sm btn-danger">Delete</button>
                        </div>
                    ) ) : <></> }
                    </div>
                </div>
                <div className={formAddress}>
                    <div className="form-address-box">
                        <button onClick={e => {hiddenFormAddress(); resetAddress()}} type="button" className="btn-close" aria-label="Close"></button>
                        { addressPicked.id ? <FormEditAddress data={addressPicked}/> : <FormAddAddress sendData={getData}/> }
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated
    }
};

export default connect(mapStateToProps)(MyAddress);