import React, { useState, useContext } from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import { ProfileOutlined, RedditOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AuthService from '../services/AuthService';
import {AuthContext} from '../context/AuthContext';
import '../styles/authentication.css';

export default function Register(props){
    const { setUser, setisAuthenticated } = useContext(AuthContext)
    const [ showError, setShowError ] = useState(false)

    function onFinish(values) {
        //console.log("Form Register Passing Values to API", values)

        AuthService.register(values).then(user => {
            setUser(user)
            setisAuthenticated(true)
            props.history.push('/home')
        })
        .catch(error => setShowError(true))
    }

    return(
        <Row className="register-container">
            <Col span={24}>
                {showError ?
                    <Row className="authentication-error-container">
                        <Col offset={1} span={2}>
                            <ExclamationCircleOutlined className="icon"/>
                        </Col>
                        <Col offset={1} span={20}>
                            <h4>Sorry! The username is already taken</h4>
                        </Col>
                    </Row> 
                : null}

                <Form onFinish={onFinish}>
                    <Row>
                        <Col className="header" span={24}>
                            <span>Your Good Ol' Name</span>
                        </Col>
                    </Row>
                    <Form.Item name="firstName" rules={ [{ required: true }] } >
                        <Input prefix={<ProfileOutlined className="site-form-item-icon" />} placeholder="First Name" />
                    </Form.Item>
                    
                    <Row>
                        <Col className="header" span={24}>
                            <span>Finish It ~</span>
                        </Col>
                    </Row>
                    <Form.Item name="lastName" rules={ [{ required: true }] } >
                        <Input prefix={<ProfileOutlined className="site-form-item-icon" />} placeholder="Last Name" />
                    </Form.Item>
                    
                    <Row>
                        <Col className="header" span={24}>
                        <span>Ghost Name?</span>
                        </Col>
                    </Row>
                    <Form.Item name="username" rules={ [{ required: true }] } >
                        <Input prefix={<RedditOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    
                    <Row>
                        <Col className="header" span={24}>
                            <span>Your Secret Key</span>
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
                        <Button shape="round" htmlType="submit">
                            Sign Me Up
                        </Button>
                    </Form.Item>
            
                </Form>
            </Col>
        </Row>
    )
}