import React, { useState, useEffect } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import "../css/formaddress.css";
import "../css/checkout.css";
import FormAddAddress from "../Component/formAddAddress";
import { addOrderForPaid } from "../reducer/ActionsProduct";

const CheckoutProduct = ({ isAuthenticated, user, addOrderForPaid }) => {
    const [ formData, setFormData ] = useState([]);
    const [ addressData, setAddressData ] = useState([])
    const getCartData = async () => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer  ${ localStorage.getItem('access') }`
            }
        };
        const body = JSON.stringify({
            "carts": localStorage.getItem('carts').split(","),
            "products": localStorage.getItem('products').split(","),
            "address": localStorage.getItem('address').split(",")
        })
        try {
            const res = await axios.post("http://localhost:8000/product/checkout/address/", body, config);
            setFormData(res.data);
        } catch (error) {
            console.log(error);
        }
    }
    const getAddressData = async () => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer  ${ localStorage.getItem('access') }`
            }
        };
        try {
            const res = await axios.get(`http://localhost:8000/product/shipping/address/`, config);
            setAddressData(res.data.results);
        } catch (error) {
            console.log(error);
        }
    }
    const truncate = ( str, numberOfChar ) => {
        return str.length > numberOfChar? str.substring(0, (numberOfChar - 3)) + "...": str;
    };
    const [ formAddress, setFormAddress ] = useState("overlay d-none")
    const showFormAddress = () => setFormAddress("overlay");
    const hiddenFormAddress = () => setFormAddress("overlay d-none");
    const getData = async () => {
        await getAddressData();
        hiddenFormAddress();
    };
    const [ providerList, setProviderList ] = useState({});
    const checkPrice = async ( address_id, area_id_buyer, lat_buyer, lng_buyer, suburb_id_buyer, area_id_seller, lat_seller, lng_seller, suburb_id_seller, length_product, width_product, height_product, weight_product, price_product ) => {
        const cod = false;
        let destination = null;
        if ( lat_buyer && lng_buyer ) {
            destination = {
                "lat": lat_buyer,
                "lng": lng_buyer,
                "suburb_id": suburb_id_buyer
            };
        } else {
            destination = {
                "area_id": area_id_buyer,
                "suburb_id": suburb_id_buyer
            };
        }
        const for_order = true;
        const height = parseFloat(height_product);
        const item_value = price_product;
        const length = parseFloat(length_product);
        let origin = null;
        if ( lat_seller && lng_seller ) {
            origin = {
                "lat": lat_seller,
                "lng": lng_seller,
                "suburb_id": suburb_id_seller
            };
        } else {
            origin = {
                "area_id": area_id_seller,
                "suburb_id": suburb_id_seller
            };
        }
        const page = 1;
        const sort_by = ["final_price"];
        const weight = weight_product;
        const width = parseFloat(width_product);
        const body = JSON.stringify({ cod, destination, for_order, height, item_value, length, origin, page, sort_by, weight, width });
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        try {
            const res = await axios.post("http://localhost:8000/product/price-check/", body, config);
            setProviderList({ ...providerList, [address_id]: res.data.pricings});
        } catch (error) {
            console.log(error)
        }
    };
    const setAddressBuyer = (e, data) => {
        const area_id_buyer = parseInt(e.target.options[e.target.selectedIndex].getAttribute('area_id'));
        const lat_buyer = e.target.options[e.target.selectedIndex].getAttribute('lat');
        const lng_buyer = e.target.options[e.target.selectedIndex].getAttribute('lng');
        const suburb_id_buyer = parseInt(e.target.options[e.target.selectedIndex].getAttribute('suburb_id'));
        const area_id_seller = data.area_id;
        const lat_seller = data.latitude;
        const lng_seller = data.longlitude; 
        const suburb_id_seller = data.suburb_id;
        let volume = 0;
        let weightTotal = 0
        let priceTotal = 0
        for (let i = 0; i < data.products.length; i++) {
            let volumePerItem = data.products[i].length * data.products[i].width * data.products[i].height * data.products[i].carts[0].amount;
            volume = volume + volumePerItem;
            let weightPerItem = data.products[i].weight * data.products[i].carts[0].amount;
            weightTotal = weightTotal + weightPerItem
            let pricePerItem = data.products[i].price * data.products[i].carts[0].amount;
            priceTotal = priceTotal + pricePerItem
        };
        const length_product = Math.cbrt(volume).toFixed(2);
        const width_product = Math.cbrt(volume).toFixed(2);
        const height_product = Math.cbrt(volume).toFixed(2);
        const weight_product = weightTotal;
        const price_product = priceTotal;
        checkPrice( data.id, area_id_buyer, lat_buyer, lng_buyer, suburb_id_buyer, area_id_seller, lat_seller, lng_seller, suburb_id_seller, length_product, width_product, height_product, weight_product, price_product );
    };
    const [ costData, setCostData ] = useState({
        product_cost: 0,
        shipping_cost: 0,
        discount_cost: 0
    });
    const [ orderData, setOrderData ] = useState({})
    const getCost = (e, data) => {
        setCostData({
            ...costData,
            product_cost: parseFloat(costData.product_cost) + parseFloat(e.target.options[e.target.selectedIndex].getAttribute('product_cost')),
            shipping_cost: parseFloat(costData.shipping_cost) + parseFloat(e.target.options[e.target.selectedIndex].getAttribute('shipping_cost'))
        });
        let volume = 0;
        let weightTotal = 0
        let priceTotal = 0
        for (let i = 0; i < data.products.length; i++) {
            let volumePerItem = data.products[i].length * data.products[i].width * data.products[i].height * data.products[i].carts[0].amount;
            volume = volume + volumePerItem;
            let weightPerItem = data.products[i].weight * data.products[i].carts[0].amount;
            weightTotal = weightTotal + weightPerItem
            let pricePerItem = data.products[i].price * data.products[i].carts[0].amount;
            priceTotal = priceTotal + pricePerItem
        };
        setOrderData({
            ...orderData,
            [data.id] : {
                customer: user.pk,
                seller: data.user,
                destination: parseInt(e.target.parentElement.previousElementSibling.children[0].value),
                origin: data.id,
                product_cost: parseFloat(e.target.options[e.target.selectedIndex].getAttribute('product_cost')),
                shipping_cost: parseFloat(e.target.options[e.target.selectedIndex].getAttribute('shipping_cost')),
                courir: e.target.options[e.target.selectedIndex].text,
                weight: weightTotal,
                length: data.products.length === 1 ? parseFloat(data.products[0].length) : parseFloat(Math.cbrt(volume).toFixed(2)),
                width: data.products.length === 1 ? parseFloat(data.products[0].width): parseFloat(Math.cbrt(volume).toFixed(2)),
                height: data.products.length === 1 ? parseFloat(data.products[0].height) : parseFloat(Math.cbrt(volume).toFixed(2)),
                rate_id: parseInt(e.target.value),
                carts: data.products.map( item => item.carts[0].id )
            }
        })
    };
    const [ transactionData, setTransactionData ] = useState([]);
    const createOrder = async ( customer, seller, destination, origin, product_cost, shipping_cost, weight, length, width, height, rate_id, courir, carts ) => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ customer, seller, destination, origin, product_cost, shipping_cost, weight, length, width, height, rate_id, courir, carts });
        try {
            const res = await axios.post("http://localhost:8000/product/order-item/multiple/", body, config);
            setTransactionData(transactionData.push(res.data.transaction_id));
        } catch (error) {
            console.log(error)
        }
    };
    const paymentMidtrans = async (gross_amount, transaction_id, first_name, last_name, email ) => {
        const transaction_details = {
            "order_id": transaction_id,
            "gross_amount": parseInt(gross_amount)
        };
        const credit_card = {
            "secure" : true
        };
        const customer_details = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": "0800000000"
        };
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access')}`
            }
        };
        const body = JSON.stringify({ transaction_details, credit_card, customer_details });
        console.log(body)
        try {
            const res = await axios.post("http://localhost:8000/product/payment/", body, config);
            // localStorage.setItem("midtrans_token", res.data.token)
            localStorage.setItem("redirect_url", res.data.redirect_url);
        } catch (error) {
            console.log(error)
        }
    }
    const navigate = useNavigate();
    const waitUntil = (condition, checkInterval=100) => {
        return new Promise(resolve => {
            let interval = setInterval(() => {
                if (!condition()) return;
                clearInterval(interval);
                resolve();
            }, checkInterval)
        })
    }
    const handlePay = async () => {
        const list = formData.map( data => data.id );
        for (let i=0; i<list.length; i++) {
            await createOrder( orderData[list[i]].customer, orderData[list[i]].seller, orderData[list[i]].destination, orderData[list[i]].origin, orderData[list[i]].product_cost, orderData[list[i]].shipping_cost, orderData[list[i]].weight, orderData[list[i]].length, orderData[list[i]].width, orderData[list[i]].height, orderData[list[i]].rate_id, orderData[list[i]].courir, orderData[list[i]].carts );
        };
        await waitUntil(() => transactionData);
        await paymentMidtrans(
            ((costData.product_cost + costData.shipping_cost + costData.discount_cost).toFixed(2)*15000),
            transactionData.join("&"),
            user.first_name,
            user.last_name,
            user.email
            );
        await waitUntil(() => localStorage.getItem("redirect_url") );
        addOrderForPaid(transactionData);
        // navigate("../payment/");
        window.location.replace(localStorage.getItem("redirect_url"));
    }
    useEffect( () => {
        if ( user ) {
            getAddressData();
            if (localStorage.getItem('carts') && localStorage.getItem('products') && localStorage.getItem('address')) {
                getCartData();
            }
        }
    }, [user] );
    if ( !isAuthenticated && !localStorage.getItem('access') ) {
        return <Navigate to={"../login/"}></Navigate>
    }
    if (!localStorage.getItem('carts') || !localStorage.getItem('products') || ! localStorage.getItem('address')) {
        return <Navigate to={"../cart/"}></Navigate>
    }
    return (
        <div className="container">
            <div className="row">
                <div className="col-7">
                    <div className="cart-list-order">
                        { formData[0] ? formData.map( data => (
                        <div key={data.id}>
                            { data.products.map( item => (
                                <div className="product-box-order" key={item.id}>
                                    <img src={"http://localhost:8000" + item.pictures[0].picture} className="img-order-product" alt="..."/>
                                    <div className="cart-info-order">
                                        <h6>Seller {item.seller_name}</h6>
                                        <h6 className="">{truncate(item.title, 100)}</h6>
                                        <p className="text-muted">Price ${item.price} x {item.carts[0].amount} pcs = ${parseInt(item.price) * parseInt(item.carts[0].amount)}</p>
                                    </div>
                                </div>
                            ) ) }
                            <div className="address">
                                <select onChange={(e) => setAddressBuyer(e, data )} name="address" id="address" className="form-select mt-4">
                                    <option defaultValue>__address__</option>
                                    { addressData ? addressData.map( data => (
                                        <option value={data.id} area_id={data.area_id} suburb_id={data.suburb_id} lat={data.latitude} lng={data.longlitude} key={data.id}>{data.address_name}, {data.detail_address}, {data.area}, {data.suburb}, {data.city}, {data.state}</option>
                                    ) ) : <></> }
                                </select>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button onClick={showFormAddress} className="btn btn-sm btn-primary align-self-end">add adress</button>
                                </div>
                            </div>
                            <div className="mb-3">
                                <select onChange={e => getCost(e, data)} name="provider" id="provider" className="form-select mt-4">
                                    <option defaultValue>__Logistic Provider__</option>
                                    { providerList[data.id] ? providerList[data.id].map( (data, index) => (
                                        <option value={data.rate.id} shipping_cost={(data.total_price/15000).toFixed(2)} product_cost={data.liability_value} key={index}>{data.logistic.code} {data.rate.name} | {data.min_day} - {data.max_day} days | $ {(data.total_price/15000).toFixed(2)}</option>
                                    ) ) : <></> }
                                </select>
                            </div>
                        </div>
                        )) : <></> }
                    </div>
                </div>
                <div className="col-5">
                    <i>
                        <h3>Resume</h3>
                        <div className="checkout-resume">
                            <h5>Total Product Price : </h5>
                            <h5>$ {(costData.product_cost).toFixed(2)}</h5>
                            <h5>Total Shipping Cost :</h5>
                            <h5>$ {(costData.shipping_cost).toFixed(2)}</h5>
                            <h5>Discount :</h5>
                            <h5>$ {(costData.discount_cost).toFixed(2)}</h5>
                            <hr /><hr />
                            <h5><b>Total Cost :</b></h5>
                            <h5><b>$ {(costData.product_cost + costData.shipping_cost + costData.discount_cost).toFixed(2)}</b></h5>
                        </div>
                    </i>
                    <div className="d-grid gap-2 col-6 mx-auto mt-5">
                        <button onClick={handlePay} className="btn btn-primary" type="button">Pay</button>
                    </div>
                </div>
            </div>
            {/* Add address form */}
            <div className={formAddress}>
                <div className="form-address-box">
                    <button onClick={e => {hiddenFormAddress()}} type="button" className="btn-close" aria-label="Close"></button>
                    <FormAddAddress sendData={getData}/>
                </div>
            </div>                   
        </div>
    );
};

const mapPropsToState = (state) => {
    return {
        isAuthenticated: state.AuthReducer.isAuthenticated,
        user: state.AuthReducer.user
    }
}

export default connect( mapPropsToState, { addOrderForPaid } )( CheckoutProduct );