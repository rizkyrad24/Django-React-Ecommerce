import { combineReducers } from "redux";
import AuthReducer from "./AuthReducer";
import ProductReducer from "./ProductReducer";

const MainReducer = combineReducers({
    AuthReducer, ProductReducer
});

export default MainReducer;