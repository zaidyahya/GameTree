import { hot } from 'react-hot-loader';
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import { Layout, Row } from 'antd';
import Navbar from './components/NavBar';
import Welcome from './components/Welcome.js';
import Home from './components/Home';
import Login from './components/Login.js';
import Register from './components/Register.js';
import { AuthContext } from './context/AuthContext';
import GameProvider from './context/GameContext';
import 'antd/dist/antd.css';
import './styles/test.css';

function App() {
    const { Header, Content, Footer } = Layout
    const { isAuthenticated } = useContext(AuthContext)

    return(
        <Router>
            <Layout>
                <Header className="header-background">
                    <Navbar />
                </Header>
                <Content className="content">
                    <Row type="flex" justify="center" align="middle" style={{ border: "none" }}>
                        <Switch> 
                            <Route exact path="/" component={Welcome} />
                            <Route path="/login" component={Login}>
                                {isAuthenticated ? <Redirect to='/home' /> : null}
                            </Route>
                            <Route path="/register" component={Register} >
                                {isAuthenticated ? <Redirect to='/home' /> : null}
                            </Route>
                            {isAuthenticated ? 
                                <GameProvider>
                                    <Route path="/home" component={Home} />
                                </GameProvider>
                                : 
                                <Redirect to='/login' />}
                        </Switch>
                    </Row>
                </Content>
            </Layout>
        </Router>
    )
}
export default hot(module)(App)
