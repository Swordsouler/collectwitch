import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import awsExports from "./aws-exports";
import { Amplify } from "aws-amplify";
import "react-image-crop/src/ReactCrop.scss";

Amplify.configure(awsExports);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
