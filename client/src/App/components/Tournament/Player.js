import React, { useState, useContext, useEffect, useRef } from 'react';
import { Row, Col } from 'antd';
import { Avatar, Input, Tooltip, Button } from 'antd';
import { UserOutlined, DotChartOutlined, CheckOutlined, LoadingOutlined, ExclamationOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import { GameContext } from '../../context/GameContext';

export default function Player(props){
    const { user } = useContext(AuthContext)
    const { tournament } = useContext(GameContext)
    const [ disputeFlags, setDisputeFlags ] = useState({ loading: false, valueDisputed: "none" })
    const [ transition, setTransition ] = useState({ flag: false, color: null, icon: <CheckOutlined />})

    function doTransition(disputeFlag){
        if(disputeFlag){
            setTransition({ flag: true, color: '#80cf9a', icon: <CheckOutlined />})
        }
        else {
            setTransition({ flag: true, color: '#FFB85C', icon: <ExclamationOutlined />})
        }

        setTimeout(function(){
            setTransition({ flag: false, color: null, icon: <CheckOutlined /> });
        }, 3000)
    }

    function submitScore(){
        var disputeObject = {}
        disputeObject.playerId = user._id
        disputeObject.playerName = user.username
        disputeObject.playerNumber = props.position == 'top' ? 'playerOne' : 'playerTwo'

        props.handleDispute(disputeObject).then( res => {
            if(res){
                setDisputeFlags({ loading: true, valueDisputed: props.player.score })
            }
        })
    }

    //Didn't really work because input.value will change on every tournament update (e.g. if someone else's score gets a decision)
    //So the 'prev' state on input.value won't be the value that was sent, because input.value updates on every re-render
    //Using a preValue in input state and thus it makes using this with it redundant 
    // function usePrevious(value) {
    //     const ref = useRef();
    //     useEffect(() => {
    //       ref.current = value;
    //     });
    //     return ref.current;
    // }
    // const prevCount = usePrevious(props.player.score)


    useEffect(() => {
        if(disputeFlags['loading']){
            if(isDisputeInProgress()){
                //Keep loading
            }
            else {
                //console.log("Values are", disputeFlags['valueDisputed'], props.player.score)
                doTransition(disputeFlags['valueDisputed'] == props.player.score)
                setDisputeFlags({
                    loading: false,
                    valueDisputed: "none"
                })
            }
        }
    }, [props.player]) //Can't make it on score because when score doesn't get updated i.e. decision is a reject, it won't run


    function isDisputeInProgress(){
        const arr = tournament.disputes.find(element => element.playerId == user._id && !element.isResolved)
        return !!arr
    }

    function handleValueChange(score){
        props.handlePlayerScoreChange(props.position, score)
    }

    return(
        <Row style={{border: 'none', borderRadius: props.position == 'top' ? '10px 10px 0 0' : '0 0 10px 10px', background: props.player.isEliminated ? '#cccccc' : props.player.userId == user._id && !props.player.isEliminated ? '#aade87' : null}} data-tut={props.player.userId == user._id ? "player-location-step" : null}>
        <Col span={24} style={{border: 'none'}}>
            {props.position == "top" ? 
                <Row style={{ border: "none", marginTop: "15px", textAlign: "center" }}>
                    <Col span={props.size == 16 ? 6 : 8} offset={props.size == 16 ? 2 : 0} style={{ border: "none" }}>
                        <Avatar icon={<UserOutlined />} />
                    </Col>
                    <Col span={props.size == 16 ? 14 : 16} offset={props.size == 16 ? 1 : 0} style={{ border: "none" }}>
                        <h4 className="player-name">
                            {props.player.username}
                            <span className="player-disputes-count" data-tut={props.player.userId == user._id ? "player-num-disputes-step" : null}>disputes left : {props.player.disputesLeft}</span>
                        </h4>
                    </Col>
                </Row>
                : 
                <Row style={{ marginTop: '10px' }}>
                    <Col span={props.size == 16 ? 12 : 14} offset={props.size == 16 ? 4 : 1} style={{ border: "none" }} data-tut={props.player.userId == user._id ? "player-input-step" : "opp-player-input-step"}>
                        <Input value={props.player.score} disabled={ props.player.userId != user._id && user._id != tournament.hostId } 
                            onChange={(e) => {handleValueChange(e.target.value)}} style={{borderRadius: "10px"}} prefix={<DotChartOutlined className="site-form-item-icon" />}
                        />
                    </Col>
                    <Col span={4} offset={props.size == 16 ? 1 : 2} style={{ border: "none" }} data-tut={props.player.userId == user._id ? "player-button-step" : "opp-player-button-step"}>
                        <Tooltip title="submit">
                            <Button className="transition-test" disabled={props.player.userId != user._id || disputeFlags['loading'] || props.isMatchFinished || props.player.disputesLeft < 1} onClick={submitScore} style={{ backgroundColor: transition['flag'] ? transition['color']: null, border: transition['flag'] ? "none" : null, color: transition['flag'] ? "white" : null }} 
                                size="xs" type="default" shape="circle" icon={ disputeFlags['loading'] ? <LoadingOutlined /> : transition['icon']} />
                        </Tooltip>
                    </Col>
                </Row>
            }
            
            {props.position == "top" ?
                <Row style={{ border: "none", marginBottom: '10px' }} className="player-row-margin">
                    <Col span={props.size == 16 ? 12 : 14} offset={props.size == 16 ? 4 : 1} style={{ border: "none" }} data-tut={props.player.userId == user._id ? "player-input-step" : "opp-player-input-step"}>
                        <Input value={props.player.score} disabled={ props.player.userId != user._id && user._id != tournament.hostId } 
                            onChange={(e) => {handleValueChange(e.target.value)}} style={{borderRadius: "10px"}} prefix={<DotChartOutlined className="site-form-item-icon" />}
                        />
                    </Col>
                    <Col span={4} offset={props.size == 16 ? 1 : 2} style={{ border: "none" }} data-tut={props.player.userId == user._id ? "player-button-step" : "opp-player-button-step"}>
                        <Tooltip title="submit">
                            <Button disabled={props.player.userId != user._id || disputeFlags['loading'] || props.isMatchFinished || props.player.disputesLeft < 1} onClick={submitScore} style={{ backgroundColor: transition['flag'] ? transition['color']: null, border: transition['flag'] ? "none" : null, color: transition['flag'] ? "white" : null }}  
                                size="xs" type="default" shape="circle" icon={disputeFlags['loading'] ? <LoadingOutlined /> : transition['icon']} />
                        </Tooltip>
                    </Col>
                </Row>
                :
                <Row style={{ border: 'none', marginBottom: "15px", textAlign: "center" }} className="player-row-margin">
                    <Col span={props.size == 16 ? 6 : 8} offset={props.size == 16 ? 2 : 0} style={{ border: "none" }}>
                        <Avatar icon={<UserOutlined />} />
                    </Col>
                    <Col span={props.size == 16 ? 14 : 16} offset={props.size == 16 ? 1 : 0} style={{ border: "none" }}>
                        <h4 className="player-name">
                            {props.player.username}
                            <span className="player-disputes-count" data-tut={props.player.userId == user._id ? "player-num-disputes-step" : null}>disputes left : {props.player.disputesLeft}</span>
                        </h4>
                    </Col>
                </Row>
            }
        </Col>
        </Row>
    )
}