import React, {useEffect, useState} from 'react';
import "./Style.css";
import Reserves from "./Reserves";

function Main() {

    return (
        <div className="Main">
            <div className="Content">
            <Reserves />
            </div>
        </div>
    );
}

export default Main;
