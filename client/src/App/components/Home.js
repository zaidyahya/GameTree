import React, { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { Row, Col, Modal } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { GameContext } from '../context/GameContext';
import Lobby from './Lobby.js';
import Lobbies from './Lobbies.js';
import Leaderboard from './Leaderboard.js';
import Tournament from './Tournament/Tournament.js';
import { Route, Switch } from 'react-router-dom';
import './../styles/home.css';
import gamepad from '../images/gamepad.svg';
import podium from '../images/podium.svg';

let socket;

export default function Home(props) {
    //const ENDPOINT = 'http://localhost:5000'
    const ENDPOINT = 'http://138.197.140.36';

    const { user } = useContext(AuthContext)
    const { setLobby, setLobbies, setChat, tournament, setTournament } = useContext(GameContext)


    useEffect(() => {
        //console.log("SOCKETIO EFFECT - HOME")
        socket = io(ENDPOINT, { query: `userId=${user._id}` })
    }, [ENDPOINT])

    useEffect(() => {
        //console.log("GET & ALL LOBBIES EFFECT - HOME")

        socket.on('allLobbies', lobbies => {
            //console.log('allLobbies ON', lobbies)
            setLobbies(lobbies)
        })

        socket.on('updatedLobbyState', lobby => {
            //console.log('updatedLobbyState ON', lobby)
            setLobby(lobby)
        })

        socket.on('existsInLobby', function(locations, callback) {
            promptUser().then(function(res){
                //console.log(res)
                if(res){
                    callback({ response: true })

                    //console.log(locations)
                    if(locations.tournament != null){
                        setTournament(locations.tournament)
                    }
                    else {
                        setLobby(locations.lobby)
                        takeToLobby()
                    }
                    setChat(locations.chat)
                }
                else {
                    callback({ response: false })
                }
            })
        })

        socket.on('gameStarted', tournament => {
            //console.log('gameStarted ON')
            setTournament(tournament)
        })

        socket.on('disputeRequestToAdmin', newDispute => {
            //console.log('disputeRequestToAdmin ON' , newDispute)
            setTournament(newDispute)
        })

        socket.on('updatedTournamentState', updatedTournament => {
            //console.log('updateTournamentState ON')
            setTournament(updatedTournament)
        })

        socket.on('updatedChatState', gameChat => {
            //console.log('Received chat', gameChat)
            setChat(gameChat)
        })

        socket.emit('getLeaderboard', function(res){
            //resolve(res.data)
        })

    }, [])

    function getLobbies(){
        //console.log('GET LOBBIES')

        return new Promise(function(resolve, reject){
            socket.emit('getLobbies', function(res){
                //console.log('GetLobbies Server Response', res)
                setLobbies(res.data)
                resolve(true)
            })
        })
    }

    function handleFindGame() {
        //console.log('handleFindGame (HOME)')
        props.history.push('/home/find')
    }

    function handleLeaderboard() {
        //console.log('handleLeaderbord (HOME)')
        props.history.push('/home/leaderboard')
    }

    function getLeaderboard(){
        return new Promise(function(resolve, reject){
            socket.emit('getLeaderboard', function(res){
                resolve(res.data)
            })
        })
    }

    function handleCreateLobby(lobby){ 
        //console.log('handleCreateLobby (HOME)', lobby)
        createLobby(lobby)
    }

    function createLobby(lobby){
        //console.log("Got this lobby", lobby)
        lobby.hostId = user._id
        lobby.isActive = true
        socket.emit('createLobby', lobby, function(res) {
            //console.log('CreateLobby Server Response', res)
            if(res.status){
                //console.log(res.data)
                joinLobby(res.data._id)
            }
        })
    }

    function handleJoinLobby(lobbyId){
        //console.log('handleJoinLobby (HOME)', lobbyId)
        joinLobby(lobbyId)
    }

    function takeToLobby() {
        props.history.push('/home/lobby')
    }

    function joinLobby(lobbyId){
        //console.log('joinLobby (HOME)', lobbyId)

        socket.emit('joinLobby', lobbyId, function(res){
            if(res.status){
                //console.log(res.data)
                setLobby(res.data)
                takeToLobby()
            }
        })
    }

    function handleLeaveLobby(lobbyId){
        //console.log('leaveLobby (HOME)')

        socket.emit('leaveLobby', user, lobbyId, function(res){
            if(res.status){
                props.history.push('/home/find')
            }
        })
    } 

    //Displays confirmation dialog for whether user would like to rejoin active lobby/game they are already in
    function promptUser(){
        return new Promise(function(resolve, reject){
            Modal.confirm({
                title: 'Alert!',
                content: 'You are already in a game. Would you like to re-join?',
                okText: 'Yes, take me there!',
                cancelText: 'Negative',
                onOk() {
                    resolve(true)
                },
                onCancel(){
                    resolve(false)
                }
            })
        })
    }

    function handleStartGame(lobbyId){
        //console.log('handleStartGame (HOME)')

        socket.emit('startGame', lobbyId, function(res){
            //console.log('StartGame Server Response', res)
            if(res.status){
                //console.log(res.data)
                setTournament(res.data)
            }
        })
    }

    useEffect(() => {
        if(tournament != null) {
            //console.log("TO TOURNAMENT (PAGE ROUTE EFFECT)")
            props.history.push('/home/tournament')
        }
    }, [tournament])


    function handleDispute(dispute){
        //console.log("Handling dispute", dispute)
        dispute.tournamentId = tournament._id

        return new Promise(function(resolve, reject){
            socket.emit('newDisputeFromPlayer', dispute, function(res){
                if(res.status){
                    resolve(true)
                }
            })
        })
    }

    function handleAdminDecision(decision, dispute) {
        //console.log("Admin Decision", decision, dispute)
        socket.emit('decisionFromAdmin', decision, dispute)

        // socket.emit('decisionFromAdmin', decision, dispute, function(res){
        //    if(res.status){
        //        console.log('Callback for Admin!')
        //    }
        // })
    }

    function handleMatchDecision(matchIdentifier, match){
        //console.log("Match Decision", match, matchIdentifier)
        matchIdentifier.tournamentId = tournament._id
        socket.emit('matchDecisionFromAdmin', matchIdentifier, match) //No callback necessary yet
    }

    function sendChatMessage(msgObject){
        msgObject['userId'] = user._id
        msgObject['username'] = user.username
        socket.emit('newChatMessage', msgObject)
    }

    function handleExitFromGame(){
        props.history.push('/home/find')
    }

    function renderHome(){
        return(
            <Row className="home-container">
                <Col offset={2} span={8} className="rounded-box">
                    <Row className="paragraph">
                        <Col offset={1} span={15} className="text">
                            <p>Join your friends in existing games or create a new one</p>
                        </Col>
                        <Col offset={1} span={6} className="icon">
                            <img src={gamepad} height="100"></img>
                        </Col>
                    </Row>
                    <Row className="button" style={{ backgroundColor: "#64a4d9"}}>
                        <Col span={24}  onClick={handleFindGame}>
                            <h2>Find Game</h2>
                        </Col>
                    </Row>
                </Col>

                <Col offset={4} span={8} className="rounded-box">
                    <Row className="paragraph">
                        <Col offset={1} span={15} className="text">
                            <p>See how your record stacks up against your colleagues</p>
                        </Col>
                        <Col offset={1} span={6} className="icon">
                            <img src={podium} height="100"></img>
                        </Col>
                    </Row>
                    <Row className="button" style={{ backgroundColor: "#FFC720"}}>
                        <Col span={24} onClick={handleLeaderboard}>
                            <h2>Leaderboard</h2>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }

    return(
        <Switch>
            <Route exact path="/home" render={(props) => renderHome()} />
            <Route path="/home/find" render={(props) => <Lobbies {...props} getLobbies={getLobbies} onCreateLobby={handleCreateLobby} onJoinLobby={handleJoinLobby} />} />
            <Route path="/home/leaderboard" render={(props) => <Leaderboard getLeaderboard={getLeaderboard} />} />
            <Route path="/home/lobby" render={(props) => <Lobby {...props} onStartGame={handleStartGame} onLeaveLobby={handleLeaveLobby} onNewChatMessage={sendChatMessage} />} />
            <Route path="/home/tournament" render={(props) => <Tournament {...props} onMatchDecision={handleMatchDecision} onSendDispute={handleDispute} onAdminDecision={handleAdminDecision} onNewChatMessage={sendChatMessage} onGameExit={handleExitFromGame} />} />
        </Switch>            
    )
}
