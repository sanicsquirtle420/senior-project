import { HashRouter as Router, Routes, Route } from "react-router-dom" ;
import { ProtectedRoute } from "./utils/ProtectedRoute" ;
import { lazy, Suspense } from "react" ;
const Index = lazy(() => import("./pages/index")) ; 
const Dashboard = lazy(() => import("./pages/dashboard")) ;
const Login = lazy(() => import("./pages/login")) ;
const Signup = lazy(() => import("./pages/signup")) ;

function App() {
    return(
        <Router>
            <Suspense fallback={
                <div>
                    <center>
                        <h2>Loading...</h2>
                        <img className="loading-gif" src="https://media1.tenor.com/m/WhpJvJkWSMcAAAAd/kiriko-kiriko-wave.gif" alt="Kiriko Overwatch waving gif"/>
                    </center>
                </div>
            }>
                <Routes>
                    <Route path="/" element={<Index />}></Route>
                    <Route path="/login" element={<Login />}></Route>
                    <Route path="/signup" element={<Signup />}></Route>

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />}></Route>
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    )
}

export default App ;