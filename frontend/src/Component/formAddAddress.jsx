import React from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import image from "../img/marker-icon.png";

const FormAddAddress = ({ user, sendData }) => {
    const [ formData, setFormData ] = useState({
        address_name: "",
        name: "",
        phone: "",
        detail_address: "",
        area: "",
        area_id: "",
        suburb: "",
        suburb_id: "",
        city: "",
        city_id: "",
        state: "",
        state_id: "",
        country: "",
        country_id: "",
        latitude: "",
        longlitude: ""
    });
    const { address_name, name, phone, detail_address, area, area_id, suburb, suburb_id, city, city_id, state, state_id, country, country_id, latitude, longlitude } = formData;
    const getValueInput = e => setFormData({ ...formData, [e.target.name]: e.target.options[e.target.selectedIndex].text, [e.target.id]: e.target.value });
    const handlingInput = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlingSubmit = async (e) => {
        e.preventDefault();
        if ( user ) {
            await addAddress(user.pk);
            resetFormData();
            addressHasAdded();
        };
    };
    const resetFormData = () => {
        setFormData({
            address_name: "",
            name: "",
            phone: "",
            detail_address: "",
            area: "",
            area_id: "",
            suburb: "",
            suburb_id: "",
            city: "",
            city_id: "",
            state: "",
            state_id: "",
            country: "",
            country_id: "",
            latitude: "",
            longlitude: ""
        })
    };
    const addAddress = async (user) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({
            user,
            address_name,
            name,
            phone,
            detail_address,
            area, 
            area_id,
            suburb,
            suburb_id,
            city,
            city_id,
            state,
            state_id,
            country,
            country_id,
            latitude,
            longlitude
        });
        try {
            await axios.post("http://localhost:8000/product/shipping/address/", body, config);
        } catch (error) {
            console.log(error);
        }
    }
    const [ countryForm, setCountryForm ] = useState([]);
    const getCountryAPI = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get("http://localhost:8000/product/address/country/", config);
            setCountryForm(res.data);
        } catch (error) {
            console.log(error);
        }
    };
    const [ stateForm, setStateForm ] = useState([]);
    const getStateAPI = async () => {
        const country = document.getElementById('country_id')
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/address/state/${country.value}/`, config);
            setStateForm(res.data);
        } catch (error) {
            console.log(error);
        };
    };
    const [ cityForm, setCityForm ] = useState([]);
    const getCityAPI = async () => {
        const state = document.getElementById('state_id')
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/address/city/${state.value}/`, config);
            setCityForm(res.data);
        } catch (error) {
            console.log(error);
        };
    };
    const [ suburbForm, setSuburbForm ] = useState([]);
    const getSuburbAPI = async () => {
        const city = document.getElementById('city_id')
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/address/suburb/${city.value}/`, config);
            setSuburbForm(res.data);
        } catch (error) {
            console.log(error);
        };
    };
    const [ areaForm, setAreaForm ] = useState([]);
    const getAreaAPI = async () => {
        const suburb = document.getElementById('suburb_id')
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/address/area/${suburb.value}/`, config);
            setAreaForm(res.data);
        } catch (error) {
            console.log(error);
        };
    };
    const [ location, setLocation ] = useState({
        lat: "",
        lng: ""
    })
    const getCurrentLocation = () => {
        if ( navigator.geolocation ) {
            navigator.geolocation.getCurrentPosition( position => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
            } )
        }
    };
    const getAreaLocation = () => {
        const area = document.getElementById('area_id');
        const data_lat = area.options[area.selectedIndex].getAttribute('data-lat');
        const data_lng = area.options[area.selectedIndex].getAttribute('data-lng');
        setLocation({ lat: data_lat, lng: data_lng });
    };
    const PointMap = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setLocation({
                    lat: lat,
                    lng: lng
                })
            }
        });
        return null
    };
    const MapCenter = () => {
        const map = useMap();
        map.flyTo([location.lat, location.lng]);
        return null;
    };
    const [ classMap, setClassMap ] = useState("map-box d-none");
    const showMap = () => setClassMap("map-box");
    const hideMap = () => setClassMap("map-box d-none");
    const saveLocation = () => setFormData({ ...formData, latitude: location.lat, longlitude: location.lng });
    const addressHasAdded = () => {
        sendData();
    }
    useEffect( () => {
        if ( user ) {
            getCountryAPI();
        }
    }, [user] );
    return (
        <div className="">
            <div className="">
                <h1>Add Address</h1>
                <form className="mb-3 row g-3" onSubmit={e => handlingSubmit(e)}>
                    <div className="col-12">
                        <label htmlFor="address_name" className="form-label">Address Name</label>
                        <input name="address_name" value={address_name} onChange={e => handlingInput(e)} type="text" className="form-control" id="detail_address" placeholder="Address Name"/>
                    </div>
                    <div className="col-6">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input name="name" value={name} onChange={e => handlingInput(e)} type="text" className="form-control" id="detail_address" placeholder="Name"/>
                    </div>
                    <div className="col-6">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input name="phone" value={phone} onChange={e => handlingInput(e)} type="text" className="form-control" id="detail_address" placeholder="phone"/>
                    </div>
                    <div className="col-4">
                        <label htmlFor="country" className="form-label">country</label>
                        <select onChange={(e) => {getStateAPI(); getValueInput(e)}} name="country" className="form-select" id="country_id">
                            <option defaultValue>__address__</option>
                            { countryForm ? countryForm.map( data => <option key={data.id} value={data.id}>{data.name}</option> ) : <></> }
                        </select>
                    </div>
                    <div className="col-4">
                        <label htmlFor="state" className="form-label">State</label>
                        <select onChange={(e) => {getCityAPI(); getValueInput(e)}} name="state" className="form-select" id="state_id">
                            <option defaultValue>__address__</option>
                            { stateForm ? stateForm.map( data => <option key={data.id} value={data.id}>{data.name}</option> ) : <></> }
                        </select>
                    </div>
                    <div className="col-4">
                        <label htmlFor="city" className="form-label">City</label>
                        <select onChange={(e) => {getSuburbAPI(); getValueInput(e)}} name="city" className="form-select" id="city_id">
                            <option defaultValue>__address__</option>
                            { cityForm ? cityForm.map( data => <option key={data.id} value={data.id}>{data.name}</option> ) : <></> }
                        </select>
                    </div>
                    <div className="col-6">
                        <label htmlFor="suburb" className="form-label">Suburb/Kecamatan</label>
                        <select onChange={(e) => {getAreaAPI(); getValueInput(e)}} name="suburb" className="form-select" id="suburb_id">
                            <option defaultValue>__address__</option>
                            { suburbForm ? suburbForm.map( data => <option key={data.id} value={data.id}>{data.name}</option> ) : <></> }
                        </select>
                    </div>
                    <div className="col-6">
                        <label htmlFor="area" className="form-label">Area/Kelurahan</label>
                        <select onChange={(e) => {getValueInput(e)}} name="area" className="form-select" id="area_id">
                            <option defaultValue>__address__</option>
                            { areaForm ? areaForm.map( data => <option key={data.id} value={data.id} data-lat={data.lat} data-lng={data.lng}>{data.name}</option> ) : <></> }
                        </select>
                    </div>
                    <div className="col-12">
                        <label htmlFor="detail_address" className="form-label">Detail Address</label>
                        <textarea name="detail_address" value={detail_address} onChange={e => handlingInput(e)} type="text" className="form-control" id="detail_address" placeholder="Detail Address ..."/>
                    </div>
                    <div className="col-12">
                        <label htmlFor="location" className="form-label">Location</label><br />
                        <button onClick={e => {getAreaLocation(); showMap()}} name="location" type="button" className="btn btn-primary" id="location">Pin Point</button>
                    </div>
                    <div className="col-12 d-grid gap-2">
                        <button className="btn btn-primary" type="submit">Add Address</button>
                    </div>
                </form>
            </div>
            <div className={classMap}>
                <button onClick={hideMap} type="button" className="btn-close" aria-label="Close"></button>
                <div id="map">
                    { (location.lat !== "" && location.lng !== "") ? (
                        <MapContainer center={[location.lat, location.lng]} zoom={13} scrollWheelZoom={true} style={{height: "300px"}}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <PointMap />
                            <MapCenter />
                            <Marker position={[location.lat, location.lng]} icon={L.icon({ iconUrl: image })}></Marker>
                        </MapContainer>
                    ) : (<></>) }
                </div>
                <div className="location-info">
                    <span>Latitude : {location.lat}</span>
                    <span>Longitude : {location.lng}</span>
                </div>
                <div className="d-grid gap-2 col-6 mx-auto mt-4">
                    <button onClick={getCurrentLocation} className="btn btn-warning btn-sm" type="button">Current Location</button>
                    <button onClick={getAreaLocation} className="btn btn-warning btn-sm" type="button">Back to Area Location</button>
                    <button onClick={e => {saveLocation(); hideMap()}} className="btn btn-primary" type="button">Save Position</button>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        user: state.AuthReducer.user
    }
};

export default connect( mapStateToProps )( FormAddAddress );