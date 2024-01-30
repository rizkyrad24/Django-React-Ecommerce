import React from "react";
import axios from "axios";

const FormAddPicture = ({ data_id, refreshData }) => {
    const addPictures = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.post(`http://localhost:8000/product/picture/${data_id}/`, formData, config);
        } catch (error) {
            console.log(error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        let formData = new FormData(e.target);
        await addPictures(formData);
        picturesAdded();
    };
    const picturesAdded = () => {
        refreshData();
    }
    return (
        <form onSubmit={ e => handleSubmit(e) } encType="multipart/form-data">
            <div className="mb-3">
                <label htmlFor="formFile" className="form-label">Product Picture</label>
                <input accept="image/*" multiple name="picture[]" className="form-control" type="file" id="formFile"/>
            </div>
            <div className="d-grid gap-2 col-6 mx-auto">
                <button className="btn btn-primary" type="submit">Add Pictures</button>
            </div>
        </form>
    );
};

export default FormAddPicture;