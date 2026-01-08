import { WalletConnection } from "./WalletConnection"

export function Navbar() {
    return (
        <nav className="p-2 bg-pink-500 text-white text-lg flex flex-row items-center justify-between">
            <p className="logo font-bold">Shelbew</p>
            <WalletConnection/>
        </nav>
    )
}