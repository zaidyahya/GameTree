import React, { useState, useEffect } from 'react';
import { Row, Col, Modal } from 'antd';
import winGif from '../../images/win.gif';
import loseGif from '../../images/lose.gif';

export default function WinnerModal(props){
    const [ show, setShow ] = useState(true);

    function hideModal(){
        setShow(false)
    }

    return(
        <Modal
            visible={show}
            width={600}
            footer={null}
            onCancel={hideModal}
        >
            <Row className="winner-modal">
                <Col className="gif-container" span={12}>
                    <img src={props.success ? winGif : loseGif} className="gif" style={{ borderRadius: props.success ? "50%" : "5%" }}></img>
                </Col>
                <Col className="header-container" span={12}>
                    {props.success ? 
                    <h1>Congratulations!</h1> : <h1>Better Luck Next Time!</h1>}
                    {props.success ? 
                        <p>You are the winner &nbsp;&#127881;</p>
                        : <p>{props.name} is the winner &nbsp;&#128079;</p>}
                </Col>
            </Row>
        </Modal>
    )
}