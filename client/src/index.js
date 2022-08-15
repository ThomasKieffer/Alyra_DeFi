import React from 'react'
import ReactDOM from 'react-dom';
import "@fontsource/montserrat";
import './index.css';
import App from './App';
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

ReactDOM.render(

    <React.StrictMode>
      <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
        <App />
        </NotificationProvider>
      </MoralisProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );