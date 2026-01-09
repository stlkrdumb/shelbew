import type { PropsWithChildren } from "react";
import { AppProviders } from "./AppProviders";
import { Footer } from "./components/Footer";

function App({ children }: PropsWithChildren) {
  return (
    <>
    <div className="bg-chocodark text-white">
      {children}
    </div>
    <Footer/>
    </>
  );
}
export default App
