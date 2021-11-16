import React, { useState, useEffect } from 'react';
import {Row, Col, Tooltip, Button} from 'antd';
import Player from './Player.js';

export default function Match(props){
    const [ matchItem, setMatchItem ] = useState(null)

    useEffect(() => {
        //console.log("MATCH CHANGED EFFECT (MATCH)")
        setMatchItem(props.match)
    }, [props.match])

    //Methods for conditional margining (based on tournament sizes thus shapes)
    function determineMargin(){
        switch (props.round){
            case 0:
                return props.isFirst ? 0 : 25
            case 1:
                return props.isFirst ? 115 : 115 + 130
            case 2:
                return props.isFirst ? 293 : 293 + 310
            case 3:
                return 560
            default:
                0
        }
    }

    function determineHeight() {
        switch (props.round){
            case 1:
                return 35
            case 2:
                return 150
            case 3:
                return 425
            default:
                0
        }
    }


    function onPlayerScoreChange(position, score){
        if(position == 'top'){
            setMatchItem({
                ...matchItem,
                playerOne: {
                    ...matchItem.playerOne,
                    score: score
                }
            })
        }
        else {
            setMatchItem({
                ...matchItem,
                playerTwo: {
                    ...matchItem.playerTwo,
                    score: score
                }
            })
        }
    }

    function handleDispute(dispute){
        dispute.matchId = props.match._id
        dispute.side = props.drawSide
        dispute.roundName = determineRoundName()
        dispute.value = matchItem[dispute.playerNumber].score

        //console.log(dispute)
        return new Promise(function(resolve, reject){
            resolve(props.sendDispute(dispute))
        })
    }

    function submitMatchDetails(){
        //console.log("Submitting ..", matchItem)
        var matchIdentifier = {roundName: determineRoundName(), side: props.drawSide}
        props.onMatchDecision(matchIdentifier, matchItem)
    }

    function determineRoundName(){
        switch(props.round){
            case 0:
                return props.tournamentSize == 32 ? 'r32' : props.tournamentSize == 16 ? 'rSixteen' : props.tournamentSize == 8 ? 'quarters' : ''
            case 1:
                return props.tournamentSize == 32 ? 'rSixteen' : props.tournamentSize == 16 ? 'quarters' : props.tournamentSize == 8 ? 'semis' : ''
            case 2:
                return props.tournamentSize == 32 ? 'quarters' : props.tournamentSize == 16 ? 'semis' : ''
            case 3: 
                return props.tournamentSize == 32 ? 'semis' : null
        }
    }

    return(
        <Row style={{ border: "none", marginTop: determineMargin() + "px" }}>
        {props.round != 0 ? 
            <Col style={{border: "none"}} span={24}>
                <div className={"lines top " + props.drawSide} style={{height: determineHeight() + "px"}}>

                </div>
            </Col>
        : null}

        
        {matchItem != null ?
            <Col style={{border: "1px solid lightslategray", borderRadius: "10px", opacity: matchItem['isFinished'] ? 0.5 : null }} span={24}>
                <Row gutter={[0, 0]}>
                    <Col className="gutter-row" style={{border: "none"}} span={24}>
                        <Player player={matchItem.playerOne} handleDispute={handleDispute} handlePlayerScoreChange={onPlayerScoreChange} size={props.tournamentSize} isMatchFinished={matchItem['isFinished']} position="top" />
                    </Col>
                    <Col style={{textAlign: "center", border: "none", marginTop: '15px'}} span={24}>
                        {props.isAdmin ?
                            <Row style={{border: "none"}}>
                                <Col offset={props.tournamentSize == 32 ? 1 : 2} span={6} style={{border: "none"}} > 
                                    <h3>V S</h3>
                                </Col> 
                                <Col offset={props.tournamentSize == 32 ? 1 : 2} style={{border: "none"}}>
                                    <Tooltip>
                                        <Button size="middle" type="default" shape="round" data-tut="submit-button-step" disabled={matchItem['isFinished'] || matchItem.playerOne['username'].includes('Finalist') || matchItem.playerTwo['username'].includes('Finalist')} onClick={submitMatchDetails}>Submit</Button>
                                    </Tooltip>
                                </Col> 
                            </Row> 
                        : <h3>V S</h3>}
                    </Col>
                    <Col className="gutter-row" style={{border: "none", marginTop: '15px'}} span={24}>
                        <Player player={matchItem.playerTwo} handleDispute={handleDispute} handlePlayerScoreChange={onPlayerScoreChange} size={props.tournamentSize} isMatchFinished={matchItem['isFinished']} position="bottom" />
                    </Col>
                </Row>
            </Col>
        : null}

        {props.round != 0 ? 
            <Col style={{border: "none"}} span={24}>
                <div className={"lines bottom " + props.drawSide} style={{height: determineHeight() + "px"}}> 
                </div>
            </Col>
        : null}
        </Row> 
    )
}