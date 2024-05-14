if (import.meta.hot) {
    import.meta.hot.accept();
}

import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render((<App />) as any);
