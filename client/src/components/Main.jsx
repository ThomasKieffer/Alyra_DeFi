import React, {useEffect, useState} from 'react';
import Header from "./Header";
import "./Style.css";
import {isOwner} from "../utilities/contract";
import walletStore from "../storage/wallet";


function Main() {
    const [isAdmin, setIsAdmin] = useState(false);


    const { address } = walletStore(state => ({address: state.address}));

    useEffect(() => {
        isOwner(address).then((owner) => setIsAdmin(owner));
    }, [address]);

    return (
        <div className="Main">
            <Header />
            <div className="Content">
            <p>Content</p>
            </div>
        </div>
    );
}

export default Main;
