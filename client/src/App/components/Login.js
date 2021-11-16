import React, { useState, useContext } from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import AuthService from '../services/AuthService.js';
import { AuthContext } from '../context/AuthContext';
import '../styles/authentication.css';

export default function Login(props){
    const { setUser, setisAuthenticated } = useContext(AuthContext)
    const [ showError, setShowError ] = useState(false)

    function onFinish(values) {
        //console.log("Finished login form", values)
        AuthService.login(values).then(user => {
            setUser(user)
            setisAuthenticated(true)
            props.history.push('/home')
        })
        .catch(error => setShowError(true))
    }

    return(
        <Row className="login-container">
            <Col span={24} style={{ border: 'none'}}>
                {showError ? 
                    <Row className="authentication-error-container">
                        <Col offset={1} span={2}>
                            <ExclamationCircleOutlined className="icon"/>
                        </Col>
                        <Col offset={1} span={20}>
                            <h4>Incorrect username or password</h4>
                        </Col>
                    </Row> 
                : null}

                <Form onFinish={onFinish} >
                    <Row>
                        <Col className="header" span={24}>
                            <span>Your Good Ol' Name</span>
                        </Col>
                    </Row>
                    <Form.Item name='username' rules={ [{ required: true }] } >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>

                    <Row>
                        <Col className="header" span={24}>
                            <span>Secret Key?</span>
                        </Col>
                    </Row>
                    <Form.Item name="password" rules={ [{ required: true }] } >
                        <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" shape="round" htmlType="submit">
                            Login
                        </Button>
                        <span>Don't have an account? <Link to="/register">Register Now!</Link></span>
                    </Form.Item>

                </Form>
            </Col>
        </Row>

    )
}