import type { PropsWithChildren } from "react";
import { AppProviders } from "./AppProviders";


function App({ children }: PropsWithChildren) {
  return (
    <div className="bg-pink-200">{children}</div>
  );
}
export default App
