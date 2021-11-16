import React, { useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import { Button, Row, Col } from 'antd';
import { AuthContext } from '../context/AuthContext';
import './../styles/welcome.css';

export default function Welcome(){
    const { setUser, isAuthenticated, setisAuthenticated } = useContext(AuthContext)

    useEffect(() => { //When we redirect here on logout, reset the properties
        //console.log('WELCOME EFFECT')
        setUser(null)
        setisAuthenticated(false)
    }, [])

    return (
        <Row className="welcome-container">
            <Col span={24} className="content-container">
                <div className="borders"></div>
                <div className="background">
                </div>
                <div className="borders"></div>
                <Row className="header-container">
                    <Col span={24} className="header"> 
                        <h1> Willkommen! </h1>
                    </Col> 
                    <Col span={24} className="button">
                        <Link to={!isAuthenticated ? '/login' : '/home'}>
                            <Button type="primary" size="large" >Get Started</Button>
                        </Link> 
                    </Col>
                </Row>        
            </Col>
        </Row>
    )
}