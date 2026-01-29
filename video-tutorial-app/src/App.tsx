import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { MessageProvider } from "./contexts/MessageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from "react-redux";
import { store } from "./redux/app/store";

function App() {
  return (
  <MessageProvider>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </MessageProvider>
  );
}

export default App;
