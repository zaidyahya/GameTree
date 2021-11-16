import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Input, Avatar, Tooltip, Button } from 'antd';
import { UserOutlined, DotChartOutlined, CheckOutlined, LoadingOutlined, ExclamationOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import { GameContext } from '../../context/GameContext';

export default function Final(props){
    const { user } = useContext(AuthContext)
    const { tournament } = useContext(GameContext)
    const [ matchItem, setMatchItem ] = useState(null)
    const [ disputeFlags, setDisputeFlags ] = useState({ loading: false, valueDisputed: "none", userPlayer: "none" })
    //userPlayer is to determine playerOne/Two for transition, as since both players are in this component, we need to track which one is the user so we can compare the score
    const [ transition, setTransition ] = useState({ flag: false, color: null, icon: <CheckOutlined />})

    useEffect(() => {
        //console.log("FINAL CHANGED EFFECT (FINAL)")
        setMatchItem(props.match)
    }, [props.match])

    useEffect(() => {
        if(matchItem != null){
            //console.log("Match Item Effect", matchItem)
            if(disputeFlags['loading']){
                if(isDisputeInProgress()){
                    //Keep loading
                }
                else {
                    //console.log("HEREEE ", matchItem[disputeFlags['userPlayer']].score)
                    doTransition(disputeFlags['valueDisputed'] == matchItem[disputeFlags['userPlayer']].score)
                    setDisputeFlags({
                        ...disputeFlags,
                        loading: false,
                        valueDisputed: "none"
                    })
                }
            }
        }
    }, [matchItem])

    //Methods for conditional margining (based on tournament sizes thus shapes)
    function determineMargin() {
        switch (props.tournamentSize){
            case 32:
                return 675
            case 16:
                return 150
            case 8:
                return 0
            default:
                0
        }
    }

    function determineContentMargin(){
        switch(props.tournamentSize){
            case 8:
                return 20
            default: 
                return 75
        }
    }

    function determineImageMargin() {
        switch (props.tournamentSize){
            case 32:
                return 50
            case 16:
                return 25
            case 8:
                return 0
            default:
                0
        }
    }

    function handleScoreChange(position, score){
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

    function submitScore(position){
        var dispute = {}
        dispute.playerId = user._id
        dispute.playerName = user.username
        dispute.playerNumber = position == 'top' ? 'playerOne' : 'playerTwo'

        dispute.matchId = matchItem._id
        dispute.side = null
        dispute.roundName = 'final'
        dispute.value = matchItem[dispute.playerNumber].score

        //console.log(dispute)
        props.sendDispute(dispute).then( res => {
            if(res){
                setDisputeFlags({ loading: true, valueDisputed: matchItem[dispute.playerNumber].score, userPlayer: dispute.playerNumber })
            }
        })
    }

    function submitMatchDetails(){
        //console.log("Submitting ..", matchItem)
        var matchIdentifier = {roundName: 'final', side: null}
        props.onMatchDecision(matchIdentifier, matchItem)
    }

    function doTransition(disputeFlag){
        if(disputeFlag){
            setTransition({ flag: true, color: '#80cf9a', icon: <CheckOutlined />})
        }
        else {
            setTransition({ flag: true, color: '#FFB85C', icon: <ExclamationOutlined />})
        }

        setTimeout(function(){
            setTransition({ flag: false, color: null, icon: <CheckOutlined /> })
        }, 3000)
    }

    function isDisputeInProgress(){
        const arr = tournament.disputes.find(element => element.playerId == user._id && !element.isResolved)   
        return !!arr
    }

    return (
        <Row className="final-container" style={{ border: "none", marginTop: determineMargin() + 'px'}}>
            <Col span={24} className="final-header" style={{border: "none"}}>
                <h1>FINALE</h1>
            </Col>
            <Col offset={1} span={22} className="final-content-container" style={{ border: "none", marginTop: determineContentMargin() + 'px'}}>
                {matchItem != null ? 
                <Row>
                    <Col span={24} style={{ border: tournament.isCompleted && matchItem.playerOne['username'] == tournament.final.winner ? "3px solid #cccccc" : "none", borderRadius: '6px', background: tournament.isCompleted && matchItem.playerOne['username'] == tournament.final.winner ? "#c8f2ac" : matchItem.playerOne['isEliminated'] ? '#cccccc' : matchItem.playerOne['userId'] == user._id && !matchItem.playerOne['isEliminated'] ? '#aade87' : null }}>
                        <Row style={{ textAlign: "center", marginTop: '5px', border: "none" }}>
                            <Col offset={1} span={6} style={{border: "none"}}>
                                <Avatar size="large" icon={<UserOutlined />} />
                            </Col>
                            <Col span={16} style={{border: "none"}}>
                                <h4 className="final-player-name">
                                    {matchItem.playerOne.username}
                                    <span className="player-disputes-count">disputes left : {matchItem.playerOne.disputesLeft}</span>
                                </h4>
                            </Col>
                        </Row>
                        <Row style={{ textAlign: "center", marginTop: "20px", marginBottom: "10px", border: "none"  }}>
                            <Col offset={3} span={14} style={{border: "none"}}>
                                <Input size="large" value={matchItem.playerOne['score']} onChange={(e) => {handleScoreChange("top", e.target.value)}}
                                    disabled={ matchItem.playerOne['userId'] != user._id && user._id != tournament.hostId } style={{borderRadius: "10px"}} prefix={<DotChartOutlined className="site-form-item-icon" />}
                                />
                            </Col>
                            <Col offset={1} span={4} style={{border: "none"}}>
                                <Tooltip title="submit" >
                                    {matchItem.playerOne['userId'] == user._id ?
                                        <Button size="middle" style={{marginTop: "4px"}} type="default" shape="circle" style={{ backgroundColor: transition['flag'] ? transition['color']: null, border: transition['flag'] ? "none" : null, color: transition['flag'] ? "white" : null }} 
                                            disabled={disputeFlags['loading']} onClick={() => {submitScore("top")}} icon={ disputeFlags['loading'] ? <LoadingOutlined /> : transition['icon']} />
                                        :
                                        <Button size="middle" style={{marginTop: "4px"}} disabled={true} type="default" shape="circle" icon={<CheckOutlined />} /> 
                                    }
                                </Tooltip>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24} className="final-image-container" style={{ marginTop: determineImageMargin() + "px", marginBottom: determineImageMargin() + "px" }}>
                        <div className="trophy">

                        </div>
                    </Col>
                    <Col span={24} style={{ border: tournament.isCompleted && matchItem.playerTwo['username'] == tournament.final.winner ? "3px solid #cccccc" : "none", borderRadius: '6px', background: tournament.isCompleted && matchItem.playerTwo['username'] == tournament.final.winner ? "#c8f2ac" : matchItem.playerTwo['isEliminated'] ? '#cccccc' : matchItem.playerTwo['userId'] == user._id && !matchItem.playerTwo['isEliminated'] ? '#aade87' : null }}>
                        <Row style={{ textAlign: "center", marginTop: '10px', border: 'none' }}>
                            <Col offset={3} span={14} style={{border: "none"}}>
                                <Input size="large" value={matchItem.playerTwo['score']} onChange={(e) => {handleScoreChange("bottom", e.target.value)}} 
                                    disabled={ matchItem.playerTwo['userId'] != user._id && user._id != tournament.hostId } style={{borderRadius: "10px"}} prefix={<DotChartOutlined className="site-form-item-icon" />}
                                />
                            </Col>
                            <Col offset={1} span={4} style={{ border: "none" }}>
                                <Tooltip title="submit">
                                    {matchItem.playerTwo['userId'] == user._id ? 
                                        <Button size="middle" style={{marginTop: "4px"}} type="default" shape="circle" style={{ backgroundColor: transition['flag'] ? transition['color']: null, border: transition['flag'] ? "none" : null, color: transition['flag'] ? "white" : null }} 
                                            disabled={disputeFlags['loading']} onClick={() => {submitScore("bottom")}} icon={ disputeFlags['loading'] ? <LoadingOutlined /> : transition['icon']} />
                                        : 
                                        <Button size="middle" style={{marginTop: "4px"}} disabled={true} type="default" shape="circle" icon={<CheckOutlined />} /> 
                                    }
                                </Tooltip>
                            </Col>
                        </Row>
                        <Row style={{ textAlign: "center", marginTop: "20px", marginBottom: '10px', border: 'none' }}>
                            <Col offset={1} span={6} style={{border: "none"}}>
                                <Avatar size="large" icon={<UserOutlined />} />
                            </Col>
                            <Col span={16} style={{border: "none"}}>
                                <h4 className="final-player-name">
                                    {matchItem.playerTwo.username}
                                    <span className="player-disputes-count">disputes left : {matchItem.playerTwo.disputesLeft}</span>
                                </h4>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24} style={{ textAlign: "center", marginTop: "10px" }}>
                        <Button size="middle" type="default" shape="round" onClick={submitMatchDetails} disabled={matchItem.playerOne['username'].includes('Finalist') || matchItem.playerTwo['username'].includes('Finalist') || tournament.isCompleted}>Submit</Button>
                    </Col>
                </Row>
                : null }
            </Col>
        </Row>

    )
}