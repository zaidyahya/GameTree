import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Modal, Slider, Button } from 'antd';
import { ApartmentOutlined, CloseOutlined } from '@ant-design/icons';

export default function CreateLobby(props){
    const [ lobby, setLobby ]  = useState({ name: "", size: 0, players: [], isGameStarted: false, disputes: 0 })
    // Used to display the error message
    // Decided not to use the ant-d Form capabilities because the modal footer has the submit buttons; they wouldn't fall inside the Form component
    const [ submitPressed, setSubmitPressed ] = useState(false)

    function handleOk(){
        setSubmitPressed(true)
        if(lobby.name != "" && lobby.size != 0 && lobby.disputes != 0){
            props.onCreateLobby(lobby)
        }
    }

    function handleCancel(){
        props.onCancelLobby()
    }

    useEffect(() => { //Whenever display is changed, reset component data
        setLobby({ name: "", size: 0, players: [], isGameStarted: false, disputes: 0 })
        setSubmitPressed(false)
    }, [props.display])

    return(
        <Modal
            visible={props.display}
            title="Create New Lobby"
            onCancel={handleCancel}
            footer={[
                <Button key="back" size="large" onClick={handleCancel} icon={<CloseOutlined /> }>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" size="large" disabled={lobby.size == 24} onClick={handleOk} icon={<ApartmentOutlined /> }>
                    Engineer
                </Button>,
            ]}
        >
            <Row gutter={[0, 16]} style={{ width: "100%" }}>
                <Col span={24}>
                    <Row className="create-row">
                        <Col span={24}>
                            <h4>Lobby Name</h4>
                        </Col>
                        <Col span={24}>
                            <Input value={lobby.name} onChange={(e) => setLobby({...lobby, name: e.target.value})} />
                            {lobby.name == "" && submitPressed ? <p className="error-message">Your lobby must have a name</p> : null}
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row className="create-row">
                        <Col span={6}>
                            <h4>Size</h4>
                        </Col>
                        <Col span={18}>
                            <span style={{ fontWeight: "600" }}>{lobby.size}</span>
                            {lobby.size == 24 ?  <span style={{ float: "right", color: "red" }}>Size cannot be 24</span> : null }
                        </Col>
                        <Col span={24}>
                            <Slider max={32} value={lobby.size} step={8} onChange={(e) => setLobby({...lobby, size: e})} />
                            {lobby.size == "" && submitPressed ? <p className="error-message">Size of the lobby must be greater than zero</p> : null}
                        </Col>
                        <Col span={24} style={{marginTop: "-8px"}}>
                            <span style={{fontSize: "10px"}}>If you don't have enough players, dummy players will be added</span>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row className="create-row">
                        <Col span={8}>
                            <h4>Disputes Allowed</h4>
                        </Col>
                        <Col span={8}>
                            <span style={{ fontWeight: "600" }}>{lobby.disputes}</span>
                        </Col>
                        <Col span={8}>
                            {submitPressed && lobby.disputes == 0 ? <span style={{ color: "red" }}>Disputes cannot be zero</span> : null}
                        </Col>
                        <Col span={6}>
                            <Slider max={3} step={3} value={lobby.disputes} onChange={(e) => setLobby({...lobby, disputes: e})} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Modal>
    )
}