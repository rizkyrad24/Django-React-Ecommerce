import React from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import "../css/formaddress.css";
import FormAddAddress from "../Component/formAddAddress";

const FormAddProduct = ({ user }) => {
    const [ formData, setFormData ] = useState({
        title: "",
        category: "",
        description: "",
        width: "",
        height: "",
        length: "",
        weight: "",
        price: "",
        stock: "",
        is_active: false,
        address: "",
        slug: ""
    });
    const { title, category, description, width, height, length, weight, price, stock, is_active, address, slug } = formData;
    const handlingInput = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlingCheckbox = e => setFormData({ ...formData, [e.target.name]: e.target.checked });
    const handlingInputForSlug = e => {
        let transform = e.target.value.split(" ").join("-").toLowerCase();
        setFormData({ ...formData, [e.target.name]: e.target.value, slug: transform })
    }
    const handlingSubmit = e => {
        e.preventDefault();
        addProduct();
    };
    const addProduct = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        const seller = user.pk;
        const body = JSON.stringify({ title, category, seller, description, width, height, length, weight, price, stock, is_active, address, slug });
        try {
            await axios.post("http://localhost:8000/product/mylist/", body, config);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }
    const [ categoryList, setCategoryList ] = useState([]);
    const getCategoryList = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get("http://localhost:8000/product/category/", config);
            setCategoryList(res.data.results)
        } catch (error) {
            console.log(error);
        }
    }
    const [ addressList, setAddressList ] = useState([]);
    const getAddressList = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get("http://localhost:8000/product/shipping/address/", config);
            setAddressList(res.data.results)
        } catch (error) {
            console.log(error);
        }
    };
    const [ formAddress, setFormAddress ] = useState("overlay d-none")
    const showFormAddress = () => setFormAddress("overlay");
    const hiddenFormAddress = () => setFormAddress("overlay d-none");
    const getData = async () => {
        await getAddressList();
        hiddenFormAddress();
    };
    useEffect( () => {
        if ( user ) {
        }
        getCategoryList();
        getAddressList();
    }, [user] )
    return (
        <div>
            <div>
                <h1>Add Product</h1>
                <form className="mb-3 row g-3" onSubmit={e => handlingSubmit(e)}>
                    <div className="col-8">
                        <label htmlFor="title" className="form-label">Product Title</label>
                        <input name="title" value={title} onChange={e => {handlingInputForSlug(e)}} type="text" className="form-control" id="title" placeholder="Product Title"/>
                    </div>
                    <div className="col-4">
                        <label htmlFor="category" className="form-label">category</label>
                        <select onChange={e => handlingInput(e)} name="category" className="form-select" id="category">
                            <option defaultValue>__Category__</option>
                            { categoryList ? categoryList.map( data => <option key={data.id} value={data.id}>{data.category}</option> ) : <></> }
                        </select>
                    </div>
                    <div className="col-12">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea name="description" value={description} onChange={e => handlingInput(e)} type="text" className="form-control" id="description" placeholder="Description ..."/>
                    </div>
                    <div className="col-4">
                        <label htmlFor="width" className="form-label">Width(cm)</label>
                        <input name="width" value={width} onChange={e => handlingInput(e)} type="number" className="form-control" id="width" placeholder="Width(cm)"/>
                    </div>
                    <div className="col-4">
                        <label htmlFor="height" className="form-label">Height(cm)</label>
                        <input name="height" value={height} onChange={e => handlingInput(e)} type="number" className="form-control" id="height" placeholder="Height(cm)"/>
                    </div>
                    <div className="col-4">
                        <label htmlFor="length" className="form-label">Length(cm)</label>
                        <input name="length" value={length} onChange={e => handlingInput(e)} type="number" className="form-control" id="length" placeholder="Length(cm)"/>
                    </div>
                    <div className="col-6">
                        <label htmlFor="price" className="form-label">Price($)</label>
                        <input name="price" value={price} onChange={e => handlingInput(e)} type="number" step="0.01" className="form-control" id="price" placeholder="Price($)"/>
                    </div>
                    <div className="col-3">
                        <label htmlFor="weight" className="form-label">Weight(kg)</label>
                        <input name="weight" value={weight} onChange={e => handlingInput(e)} type="number" className="form-control" id="weight" placeholder="Weight(kg)"/>
                    </div>
                    <div className="col-3">
                        <label htmlFor="stock" className="form-label">Stock(pcs)</label>
                        <input name="stock" value={stock} onChange={e => handlingInput(e)} type="number" className="form-control" id="stock" placeholder="Stock"/>
                    </div>
                    <div className="col-12">
                        <label htmlFor="address" className="form-label">address</label>
                        <select onChange={e => handlingInput(e)} name="address" className="form-select" id="address">
                            <option defaultValue>__address__</option>
                            { addressList ? addressList.map( data => <option key={data.id} value={data.id}>{data.address_name}, {data.detail_address}, {data.area}, {data.suburb}, {data.city}, {data.state}</option> ) : <></> }
                        </select>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button onClick={showFormAddress} type="button" className="btn-sm btn-primary">add addrres</button>
                        </div>
                    </div>
                    <div className="col-12">
                        <label htmlFor="slug" className="form-label">Slug</label>
                        <input name="slug" value={slug} onChange={e => handlingInput(e)} type="text" className="form-control" id="slug" placeholder="Slug"/>
                    </div>
                    <div className="col-12">
                        <div className="form-check">
                            <input name="is_active" value="true" onClick={e => handlingCheckbox(e)} className="form-check-input" type="checkbox" id="is_active"/>
                            <label htmlFor="is_active" className="form-check-label">Activate</label>
                        </div>
                    </div>
                    <div className="col-12 d-grid gap-2">
                        <button className="btn btn-primary" type="submit">Add Product</button>
                    </div>
                </form>
            </div>
            <div className={formAddress}>
                <div className="form-address-box">
                    <button onClick={e => {hiddenFormAddress()}} type="button" className="btn-close" aria-label="Close"></button>
                    <FormAddAddress sendData={getData}/>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        user: state.AuthReducer.user
    }
};

export default connect(mapStateToProps)(FormAddProduct);