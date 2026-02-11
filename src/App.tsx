import React, { type PropsWithChildren } from "react";
import { Footer } from "./components/Footer";

function App({ children }: PropsWithChildren) {
  return (
    <>
    <div className="bg-chocodark text-white min-h-screen">
      {children}
    </div>
    <Footer/>
    </>
  );
}
export default App
