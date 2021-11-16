import React, { useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import { Row, Col, Avatar } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import AuthService from '../services/AuthService';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import bearImg from '../images/bear.png';

export default function NavBar(props){
    const { user, isAuthenticated } = useContext(AuthContext)
    const [ listOpen, setListOpen ] = useState(false)
    const history = useHistory()

    function toggleList() {
        setListOpen(!listOpen)
        document.getElementsByClassName('icon-chevron')[0].classList.toggle('down')
    }

    function handleSignOut(){
        AuthService.logout().then(res => { 
            history.push('/') //Can't reset User & isAuthenticated as we are still at Home, thus front-end will crash
            location.reload(true)
        })
        setListOpen(!listOpen)
    }

    function authenticatedDisplay(){
        return(
            <Row className="logout-bar">
                <Col span={2} style={{border: "none"}}>
                    <Link to={'/home'}>
                        <HomeOutlined style={{color: "lightgray"}} />
                    </Link>
                </Col>
                <Col offset={1} span={2} className="divider">
                    |
                </Col>
                <Col span={15} className="toggle-wrapper">
                    <Row className="toggle-header" onClick={toggleList}>
                        <Col span={4} style={{border: "none"}}>
                            <Avatar size="small" src={bearImg} />
                        </Col>
                        <Col offset={2} span={15} className="name">
                            {user['firstName']} {user['lastName']}
                        </Col >
                        <Col span={2} className="chevy" style={{border: "none", paddingTop: "3px"}}>
                            <FontAwesomeIcon icon={faChevronUp} className="icon-chevron" size="1x"/>
                        </Col>
                    </Row>
                    {listOpen && <ul className="toggle-list">
                        <li onClick={handleSignOut}>
                            <FontAwesomeIcon icon={faSignOutAlt} className="icon-chevron" size="1x"/>
                            &nbsp;&nbsp;Sign Out
                        </li>
                    </ul>}
                </Col>
            </Row>
        )
    }

    return (
        <Row className="nav-container">
            <Col className="logo">
            </Col>
            <Col className="header-container">
                <h1>Business Intelligenciá</h1>
            </Col>
            <Col offset={4} span={4} className="logout-bar-container">
                {isAuthenticated ? authenticatedDisplay() : null}
            </Col>
        </Row>
    )
}