import { HashRouter as Router, Routes, Route } from "react-router-dom" ;
import { lazy, Suspense } from "react" ;
const Index = lazy(() => import("./pages/index")) ;
const Login = lazy(() => import("./pages/login")) ;

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
                </Routes>
            </Suspense>
        </Router>
    )
}

export default App ;