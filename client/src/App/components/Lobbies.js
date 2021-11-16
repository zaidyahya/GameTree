import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './../context/AuthContext.js'
import { GameContext } from '../context/GameContext';
import { Row, Col, Button, List, Modal } from 'antd';
import CreateLobby from './CreateLobby.js';
import { ReloadOutlined } from '@ant-design/icons';
import ClockLoader from "react-spinners/ClockLoader";
import AuthService from '../services/AuthService';

export default function Lobbies(props){
    const { user, setUser } = useContext(AuthContext)
    const { lobbies, setLobbies } = useContext(GameContext)
    const [ loading, setLoading ] = useState(true)
    const [ displayCreateLobby, setDisplayCreateLobby ] = useState(false)
    const override = "display: block; margin: 0 auto"

    useEffect(() => {
        //console.log('EFFECT -> GET LOBBIES ON PAGE LOAD UP (LOBBIES)')
        //Updating the user here because game specific properties of the user may have changed 
        //Such as gamesPlayed/Won, ranking
        AuthService.isAuthenticated().then(data => { 
            setUser(data.user)
        })

        props.getLobbies().then(function(value){
            if(value){
                setLoading(false)
            }
        })
    }, [])

    function handleCreateLobby(){
        setDisplayCreateLobby(true)
    }

    function hideCreateLobby(){
        setDisplayCreateLobby(false)
    }

    function createLobby(lobby){
        props.onCreateLobby(lobby)
        hideCreateLobby()
    }

    function handleJoinLobby(){        
        var selectedLobby = lobbies.find( lobby => lobby.isSelected == true)

        var playerAlreadyExists = selectedLobby.players.find( player => player.userId == user._id)
        if(selectedLobby.isGameStarted){
            if(!!playerAlreadyExists){
                Modal.error({
                    title: 'Alert!',
                    content: 'You are already in this lobby. Please refresh the page',
                    okText: 'Roger!'
                })
            }
            else {
                Modal.error({
                    title: 'Oops!',
                    content: 'This game has already started. You cannot join it now',
                    okText: 'Ok'
                })
            }
        }
        else if(!selectedLobby.isGameStarted && !!playerAlreadyExists){
            Modal.error({
                title: 'Alert!',
                content: 'You are already in this lobby. Please refresh the page',
                okText: 'Roger!'
            })
        }
        else {
            props.onJoinLobby(selectedLobby._id)
        }
    }

    function handleLobbyListClick(id){
        let temp = JSON.parse(JSON.stringify(lobbies))
        
        temp.forEach((item, index) => {
            if(index == id){
                item.isSelected = true
            }
            else {
                item.isSelected = false
            }
        })

        setLobbies(temp)
    }

    function handleRefreshClick(){
        props.getLobbies().then(res => {
            //console.log("Refreshed succesfully")
        })
    }


    return(  
        <Row className="lobbies-container">
            <Col className="lobs-header-container" span={24}>
                <h1>Lobby List</h1>
                <Button type="default" shape="round" onClick={handleRefreshClick} icon={<ReloadOutlined/>}>
                    Refresh
                </Button>
            </Col>

            {loading ? <p>Loading ...</p> : 
            <Col className="lobs-list-container" span={24}>
                <Row className="lobs-list-header">
                    <Col className="item" span={6}>
                        Game
                    </Col>
                    <Col className="item" span={6}>
                        Players
                    </Col>
                    <Col className="item" span={6}>
                        Location
                    </Col>
                    <Col className="item" span={6}>
                        Chief Engineer
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        {lobbies != null && lobbies.length != 0 ?
                        <List className="lobs-list">
                            {lobbies.map((lobby, index) => 
                                <List.Item key={lobby._id} className="item" style={{background: lobby.isSelected ? "#f2ebe4" : "none", opacity: lobby.isGameStarted ? 0.4 : 1.0 }} onClick={() => {handleLobbyListClick(index)}}>
                                    <Col span={2} style={{border: "none" }}>
                                        <ClockLoader
                                            css={override}
                                            size={25}
                                            //color={"navy"}
                                            loading={lobby.isGameStarted} />
                                    </Col>    
                                    <Col span={4} style={{textAlign: "left", border: "none", paddingLeft: "20px" }}>{lobby.name}</Col>
                                    <Col span={6} style={{border: "none" }}>{lobby.players.length} / {lobby.size}</Col>
                                    <Col span={6} style={{border: "none" }}>Stockholm</Col>
                                    <Col span={6} style={{border: "none" }}>
                                        {lobby.players.length != 0 ? lobby.players[0].username : null}
                                    </Col>
                                </List.Item>
                            )}
                        </List>
                        : null}   
                    </Col>
                </Row>
                <Row className="lobs-btn-container">
                    <Button type="default" size="large" onClick={handleCreateLobby}> Create Lobby </Button>
                    <Button type="default" size="large" onClick={handleJoinLobby}> Join Lobby </Button>              
                </Row>
                
            </Col>
            }
            <CreateLobby display={displayCreateLobby} onCreateLobby={createLobby} onCancelLobby={hideCreateLobby} />

        </Row>
    )
}