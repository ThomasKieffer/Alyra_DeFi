import React from 'react';
import './Style.css';
import { ConnectButton } from "web3uikit"

function Wallet() {
    return (
        <>
            <div className="Wallet">
                <ConnectButton
                moralisAuth={false}/>
            </div>
        </>
    );
}
export default Wallet;
