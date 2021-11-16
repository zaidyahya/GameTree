import React, { useContext } from 'react';
import { Row, Col, Button, List, Modal } from 'antd';
import { UsbOutlined } from '@ant-design/icons';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBaby, faUserTie, faChessKnight, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import SyncLoader from "react-spinners/SyncLoader";
import Chat from './Chat.js';

export default function Lobby(props) {
    const { lobby } = useContext(GameContext)
    const { user } = useContext(AuthContext)

    function handleLeaveClick(){
        if( user._id == lobby['hostId'] ){
            Modal.confirm({
                title: 'Are you sure?',
                content: 'You are the host. If you leave, the host will be re-assigned.',
                okText: 'Yes',
                cancelText: 'No',
                onOk() {
                    props.onLeaveLobby(lobby._id);
                },
                onCancel(){
                    //Do nothing
                }
            })
        }
        else {
            props.onLeaveLobby(lobby._id);
        }
    }

    function handleStartClick(){
        props.onStartGame(lobby._id);
    }

    return(
        <Row className="lobby-container">
            <Col span={24}>
                <h1 className="lo-header">Lounge for {lobby.name}</h1>
                <Button shape="round" className="lo-back-btn" onClick={handleLeaveClick}>Leave</Button>
            </Col>
            <Col span={24}>
                <Row className="lo-list-header">
                    <Col className="item" span={12}>
                        <p>Player List</p>
                    </Col>
                    <Col className="item" span={12}>
                        <p>{lobby.players.length} Players</p>
                    </Col>
                </Row>
                <Row>
                    <Col className="lo-list" span={24}>
                        {lobby != null ? 
                        <List>
                            {lobby.players.map((player, index) =>
                            <List.Item key={player.userId} className="item" style={{ background: player.userId == user._id ? "#f2ebe4" : "none"}}>
                                <Col span={2} className="host">
                                    {player['userId'] == lobby['hostId'] ? <UsbOutlined style={{ fontSize: "20px" }} /> : null}
                                </Col>
                                <Col className="rank" offset={1} span={6}>
                                    {player.username}
                                </Col>
                                <Col className="level"  offset={2} span={6}>
                                    <span>
                                        <FontAwesomeIcon icon={ player.level == 'Expert' ? faChessKnight : player.level == 'Professional' ? faUserTie : faBaby } size='2x' />
                                    </span>
                                    <span>{player.level}</span>
                                </Col>
                                <Col className="rank" offset={2} span={6}>
                                    <span>{player.ranking}<sup>th</sup> in the</span><span><FontAwesomeIcon icon={faGlobeAmericas} size="lg" /></span>
                                </Col>
                            </List.Item>
                            )}
                        </List>
                        : null}
                    </Col>
                </Row>
            </Col>
            <Col className="lo-start-game" span={24}>
                {lobby.hostId != user._id ?
                    <div className="fix">
                        <span>Waiting for the host to start</span>
                        <span><SyncLoader size={4}/></span>
                    </div>
                    :
                    <Button type="primary" size="large" disabled={lobby.isGameStarted} onClick={handleStartClick}>Begin</Button>
                }    
            </Col>
            <Col span={24}>
                <Chat onSendMessage={props.onNewChatMessage} gameStarted={false} />
            </Col>
        </Row>
    )
}