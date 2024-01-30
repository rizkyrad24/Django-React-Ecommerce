import React from "react";
import { useState, useEffect } from "react";
import FormAddPicture from "./formAddPicture";
import FormEditPicture from "./formEditPicture";
import axios from "axios";

const ProductPictures = ({ data_id }) => {
    const [ data, setData ] = useState([]);
    const getImageList = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/picture/${data_id}/`, config);
            setData(res.data);
        } catch (error) {
            console.log(error);
        }
    };
    // edit
    const [ imagePicked, setImagePicked ] = useState(null)
    const handleEdit = (image) => {
        setImagePicked(image);
        showPictureForm();
    };
    // delete
    const deleteImage = async (picture_id) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            await axios.delete(`http://localhost:8000/product/picture/action/${picture_id}/`, config);
        } catch (error) {
            console.log(error);
        }
    }
    const handleDelete = async (picture_id) => {
        await deleteImage(picture_id);
        getImageList();
    }
    // form
    const [ pictureFormClass, setPictureFormClass ] = useState("picture-form-overlay d-none")
    const showPictureForm = () => setPictureFormClass("picture-form-overlay");
    const hiddenPictureForm = () => setPictureFormClass("picture-form-overlay d-none");
    const getData = async () => {
        await getImageList();
        hiddenPictureForm();
    };
    useEffect( () => {
        getImageList();
    }, [] )
    return (
        <div className="product-picture-box">
            <div className="pictures-list">
                { data ? data.map( item => (
                <div key={item.id} className="picture-box">
                    <div className="picture">
                        <img src={"http://localhost:8000" + item.picture} alt="" />
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => handleEdit(item)} className="btn-sm btn-warning">Change</button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                </div>
                ) ) : (
                <div className="picture-empty">
                    <h1>No Image</h1>
                </div>
                ) }
            </div>
            <div className="d-grid gap-2 col-6 mx-auto">
                <button onClick={showPictureForm} className="btn btn-primary" type="button">Add Pictures</button>
            </div>
            <div className={pictureFormClass}>
                <div className="picture-form-box">
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button onClick={e => {hiddenPictureForm()}} type="button" className="btn-close" aria-label="Close"></button>
                    </div>
                    { imagePicked ? < FormEditPicture data={imagePicked} refreshData={getData} /> : < FormAddPicture data_id={data_id} refreshData={getData}/> }
                </div>
            </div>
        </div>
    );
};

export default ProductPictures;