import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { GameContext } from '../../context/GameContext';
import { Row, Col, Button } from 'antd';
import Match from './Match.js';
import Final from './Final.js';
import Chat from '../Chat.js';
import Disputes from '../Disputes.js';
import WinnerModal from './WinnerModal.js';
import Tour from 'reactour';

export default function Tournament(props){
    const { user } = useContext(AuthContext)
    const { tournament } = useContext(GameContext)
    const [ jsxTournament, setJSXTournament ] = useState({ left: null, right: null, final: null })
    const [ showTour, setShowTour ] = useState(false)

    const adminSteps = [
        {
            selector: '[data-tut="first-step"]',
            content: `Welcome to the game! Use this tournament tree to input your scores for the game you & your team are playing. As the admin, you will have the final say on the outcomes of the matches. Lets get started!` 
        },
        {
            selector: '[data-tut="player-location-step"]',
            content: `Here is where the tournament draw placed you`
        },
        {
            selector: '[data-tut="player-input-step"]',
            content: `Your score for the match`
        },
        {
            selector: '[data-tut="opp-player-input-step"]',
            content: `Here is the score for other players`
        },
        {
            selector: '[data-tut="opp-player-button-step"]',
            content: `The dispute button. Players will use it to submit what they believe is their score. You, as the admin, will decide whether it is correct or not`
        },
        {
            selector: '[data-tut="player-num-disputes-step"]',
            content: `The remaining disputes for players show here`
        },
        {
            selector: '[data-tut="submit-button-step"]',
            content: `When you believe the scores are correct, submit them to progress to the next round`
        },
        {
            selector: '[data-tut="player-progress-step"]',
            content: `After submission, the next round in the tournament gets set up`
        },
        {
            selector: '[data-tut="disputes-step"]',
            content: `Player disputes are shown here. Use the buttons to respond with your decision`,
            position: 'top'
        },
        {
            selector: '[data-tut="chat-step"]',
            content: `Use the chat room to interact with your friends in the game`,
            position: 'top'
        },
        {
            selector: '[data-tut="first-step"]',
            content: `All set. Happy Gaming!`,
            position: 'top'
        }
    ]

    const regularSteps = [
        {
            selector: '[data-tut="first-step"]',
            content: `Welcome to the game! Use this tournament tree to input your scores for the game you & your team are playing. Lets get started!` 
        },
        {
            selector: '[data-tut="player-location-step"]',
            content: `Here is where the tournament draw placed you`
        },
        {
            selector: '[data-tut="player-input-step"]',
            content: `Your score for the match. You can change the score to what you believe it is, and dispute it with the host`
        },
        {
            selector: '[data-tut="player-button-step"]',
            content: `Use this button to dispute your score with the host. Once disputed, the button will inform you of the status of your dispute`
        },
        {
            selector: '[data-tut="player-num-disputes-step"]',
            content: `Your remaining disputes for the match`
        },
        {
            selector: '[data-tut="player-progress-step"]',
            content: `If the host confirms your victory, you progress to the next round`
        },
        {
            selector: '[data-tut="chat-step"]',
            content: `Use the chat room to interact with your friends in the game`
        },
        {
            selector: '[data-tut="first-step"]',
            content: `All set. Happy Gaming!`,
            position: 'top'
        }
    ]

    useEffect(() => {
       setTimeout(() => {
           if(user.gamesPlayed == 0 || (user._id == tournament['hostId'] && !user.adminTourShown) ){
            setShowTour(true)
           }
        }, 1000)
    }, [])

    useEffect(() => {
        //console.log('EFFECT FOR SETTING UP MATCHES (TOURNAMENT)')
        var counter = 0
        var leftSideMatches = []

        for(const round in tournament.leftDraw){
            if(tournament.leftDraw[round].length != 0 ){ //Because r32/r16 might be [] depending on game size
                leftSideMatches[counter] = []

                tournament.leftDraw[round].forEach(function(item, index){
                    leftSideMatches[counter].push(<Match match={item} isFirst={0 == index} isAdmin={user._id == tournament.hostId}
                        onMatchDecision={props.onMatchDecision} sendDispute={handleDispute} round={counter} drawSide="left" tournamentSize={tournament.size} />)
                })

                
                var temp 
                //To interchange positions of equal modulo value indices to be together to allow module use for next round progression on server
                //E.g. X0,X1,X2,X3,X4,X5,X6,X7,X8 -> X0,X4,X2,X6,X1,X5,X3,X7 (modulo = 4) , X0,X1,X2,X3 -> X0,X2,X1,X3 (modulo = 2)
                const thisSideNextRoundMatches = leftSideMatches[counter].length / 2
                for(var i=1; i < thisSideNextRoundMatches; i+=2){
                    temp = leftSideMatches[counter][i]
                    leftSideMatches[counter][i] = leftSideMatches[counter][i + thisSideNextRoundMatches - 1]
                    leftSideMatches[counter][i + thisSideNextRoundMatches - 1] = temp
                }
                counter++
            }
        }

        counter = 0

        var rightSideMatches = []
        for(const round in tournament.rightDraw){
            if(tournament.rightDraw[round].length != 0 ){ //Because r32/r16 might be [] depending on game size
                rightSideMatches[counter] = []

                tournament.rightDraw[round].forEach(function(item, index){
                    rightSideMatches[counter].push(<Match match={item} isFirst={0 == index} isAdmin={user._id == tournament.hostId}
                        onMatchDecision={props.onMatchDecision} sendDispute={handleDispute} round={counter} drawSide="right" tournamentSize={tournament.size} />)
                })

                var temp
                const thisSideNextRoundMatches = rightSideMatches[counter].length / 2;
                for(var i=1; i < thisSideNextRoundMatches; i+=2){
                    temp = rightSideMatches[counter][i]
                    rightSideMatches[counter][i] = rightSideMatches[counter][i + thisSideNextRoundMatches - 1]
                    rightSideMatches[counter][i + thisSideNextRoundMatches - 1] = temp
                }
                counter++
            }
        }

        setJSXTournament({
            left: leftSideMatches,
            right: rightSideMatches,
            final: tournament.final
        })
    }, [tournament])

    function handleDispute(object) {
        return new Promise(function(resolve, reject){
            resolve(props.onSendDispute(object))
        })
    }

    function handleAdminClick(dispute, decision){
        props.onAdminDecision(decision, JSON.parse(JSON.stringify(dispute)))
    }

    function onExitClick(){
        props.onGameExit()
    }

    return(        
        <Row className="in-game">
            <Tour
                steps={user._id == tournament['hostId'] ? adminSteps : regularSteps}
                isOpen={showTour}
                accentColor="linear-gradient(to right, #ada996, #f2f2f2)"
                className="tour-modal"
                rounded={10}
                showCloseButton={false}
                showNavigationNumber={false}
                scrollDuration={5}
                onRequestClose={() => setShowTour(false)}
            />
            <Col span={24} className="header-container">
                <h1> {tournament.name} </h1>
                <Button shape="round" onClick={onExitClick} >Exit</Button>
            </Col>

            <Col span={10} style={{border: 'none'}}>
                {jsxTournament.left != null ?
                    <Row gutter={8}>
                        {jsxTournament.left.map((round, index) => 
                            <Col className="gutter-row" span={24/jsxTournament.left.length} data-tut={index == 1 ? "player-progress-step" : null}>
                                {round.map((match, index) => match)}
                            </Col>
                        )}
                    </Row>   
                : null}                   
            </Col>

            <Col span={4} style={{border: 'none'}}>
                {jsxTournament.final != null ?
                    <Final match={jsxTournament.final} tournamentSize={tournament.size} sendDispute={handleDispute} onMatchDecision={props.onMatchDecision} />
                : null}
            </Col>

            <Col span={10} style={{border: 'none'}}>
                {jsxTournament.right != null ?
                    <Row gutter={8}>
                        {jsxTournament.right.map((round, index) => 
                            <Col className="gutter-row" span={24/jsxTournament.right.length}>
                                {jsxTournament.right[jsxTournament.right.length-index-1].map((match, index) => match)}
                            </Col>
                        )}
                    </Row>   
                : null}
            </Col> 

            <Col span={24}>
                <Chat onSendMessage={props.onNewChatMessage} gameStarted={true} />
                {tournament.hostId == user._id ?
                    <Disputes disputes={tournament.disputes} onDecision={handleAdminClick} />
                : null}
                {tournament.isCompleted ? <WinnerModal success={tournament['final']['winner'] == user['username']} name={tournament['final']['winner']} /> : null}
            </Col>
        </Row>
    )
}