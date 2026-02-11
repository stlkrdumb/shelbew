import React from "react";
import { WalletConnection } from "./WalletConnection"
import Logo from "../../public/logo.svg"

export function Navbar() {
    return (
        <div className="container text-center mx-auto lg:p-10 p-2">
            <nav className="p-2 bg-chocodark text-white text-lg flex flex-row items-center justify-between">
                <p className="logo flex items-center">
                    <img src="./logo.svg" className="w-12 mr-2 h-auto"/>
                    <span className="font-bold text-shelbypink">Shelbew</span></p>
                <WalletConnection/>
            </nav>
        </div>
        
    )
}