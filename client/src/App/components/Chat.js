import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faGamepad, faCocktail } from '@fortawesome/free-solid-svg-icons';
import { RightCircleFilled, SettingTwoTone } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext.js';
import { GameContext } from '../context/GameContext.js';

export default function Chat(props){
    const { user } = useContext(AuthContext)
    const { chat } = useContext(GameContext)
    const [ showChat, setShowChat ] = useState(true)
    const [ newMessage, setNewMessage ] = useState("")

    function handleChatClick(){
        setShowChat(!showChat)
    }

    function sendMessage(){
        var messageObject = { chatId: chat._id, content: newMessage }
        props.onSendMessage(messageObject)
    }

    useEffect(() => {        
        //Put here because scroll needs to be on updated state
        if(chat != null) {
            setNewMessage("")
            var scrollElem = document.getElementById('chat-to-scroll')
            scrollElem.scrollTop = scrollElem.scrollHeight
        }
    }, [chat])

    return( 
        <Row className="chat-container" data-tut="chat-step">
            {chat != null ?
            <Col className="chat-window" style={{ display: showChat ? "none" : ""}} span={24}>
                <Row >
                    <Col className="header" span={24} onClick={handleChatClick}>
                        <span className="game-name">
                            <span>
                                <FontAwesomeIcon style={{ color: 'green' }} size="xs" icon={faCircle} /> 
                            </span> 
                            <span>
                                {chat['tournamentName']} Room
                            </span>
                        </span>
                        <span className="game-status">
                            <span>
                                <FontAwesomeIcon style={{ color: 'black' }} size="sm" icon={ props.gameStarted? faGamepad : faCocktail } /> 
                            </span>
                            <span>
                                {props.gameStarted ? 'In Game' : 'Chilling..'}
                            </span>
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col className="messages" id="chat-to-scroll" span={24}>
                        {chat['messages'].map((message, index) =>
                        <Row key={index}>
                            <Col className="message" style={{ marginLeft: index % 2 == 0 || user._id == message['userId'] ? "2px" : "38px", backgroundColor: user._id == message['userId'] ? 'lightgreen' : 'lightgray' }} span={20}>
                                <span>{message['username']}</span>:
                                <span>{message['content']}</span>
                            </Col>
                        </Row>
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col className="send-area" span={24}>
                        <Input value={newMessage} onPressEnter={sendMessage} onChange={(e) => {setNewMessage(e.target.value)}} suffix={<RightCircleFilled onClick={sendMessage} style={{ color: "#139af7" }} />}/>
                    </Col>
                </Row>
            </Col>
            : null}

            {chat != null ? 
            <Col className="chat-click" onClick={handleChatClick} span={24}>
                <span>Chat!</span>
            </Col>
            : null}
        </Row>
    )
}