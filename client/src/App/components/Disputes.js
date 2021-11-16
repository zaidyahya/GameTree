import React, { useState } from 'react';
import {Row, Col, Button} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import './../styles/disputes.css';

export default function Disputes(props){
    const [ show, setShow ] = useState(true)

    function handleClick(){
        setShow(!show)
    }

    return(
        <Row className="disputes-container" data-tut="disputes-step">
            <Col className="disputes-window" style={{ display: show ? "none" : "" }} span={24}>
                <Row>
                    <Col className="disputes" span={24}>
                        <Row className="header">
                            <Col offset={1} span={5}>
                                Dissenter
                            </Col>
                            <Col offset={1} span={5}>
                                Value
                            </Col>
                            <Col offset={1} span={10}>
                                Your Decision
                            </Col>
                            <Col span={1} onClick={handleClick}>
                                <DownOutlined className="arrow" />
                            </Col>
                        </Row>
                        {props.disputes.map((dispute, index) =>
                            <Row className="dispute" style={{opacity: dispute.isResolved ? "0.6" : "1.0"}}>
                                <Col span={1}>
                                    {index + 1}
                                </Col>
                                <Col span={5}>
                                    {dispute.playerName}
                                </Col>
                                <Col offset={1} span={5}>
                                    {dispute.value}
                                </Col>
                                <Col offset={1} span={5}>
                                    <Button size="small" color="green" shape="round" disabled={dispute.isResolved} onClick={() => { props.onDecision(dispute, true) }}>Accept</Button>
                                </Col>
                                <Col offset={1} span={4}>
                                    <Button size="small" color="green" shape="round" disabled={dispute.isResolved}  onClick={() => { props.onDecision(dispute, false) }}>Reject</Button>
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </Col>
            <Col className="chat-click" style={{ background: "#de6e62" }} onClick={handleClick} span={24}>
                <span>Disputes</span>
            </Col>
        </Row>
    )
}