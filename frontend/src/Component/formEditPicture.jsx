import React from "react";
// import { useState } from "react";
import axios from "axios";

const FormEditPicture = ({ data, refreshData }) => {
    // const [ picture, setPicture ] = useState(null);
    // const onImageChange = (e) => {
    //     if ( e.target.files && e.target.files[0] ) {
    //         let reader = new FileReader();
    //         let files = e.target.files;
    //         reader.onloadend = () => {
    //             setPicture(files)
    //         };
    //         reader.readAsDataURL(files);
    //     }
    // };
    const editPictures = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        // const formData = new FormData();
        // formData.append('picture', picture);
        try {
            await axios.put(`http://localhost:8000/product/picture/action/${data.id}/`, formData, config);
        } catch (error) {
            console.log(error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target)
        await editPictures(formData);
        picturesAdded();
    };
    const picturesAdded = () => {
        refreshData();
    };
    return (
        <form onSubmit={ e => handleSubmit(e) } encType="multipart/form-data">
            <input type="hidden" name="product" value={data.product}/>
            <div className="mb-3">
                { data !== undefined ? <p><i>Current Picture = {data.picture}</i></p> : <></> }
                <label htmlFor="formFile" className="form-label">Product Picture</label>
                <input accept="image/*" multiple name="picture" className="form-control" type="file" id="formFile"/>
            </div>
            <div className="d-grid gap-2 col-6 mx-auto">
                <button className="btn btn-primary" type="submit">Add Pictures</button>
            </div>
        </form>
    );
};

export default FormEditPicture;