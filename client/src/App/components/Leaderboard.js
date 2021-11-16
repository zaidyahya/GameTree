import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, List } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy, faCaretUp, faCaretDown, faEquals } from '@fortawesome/free-solid-svg-icons'
import { AuthContext } from './../context/AuthContext.js'

export default function Leaderboard(props){
    //All registered users are sent sorted based on points, we display that array and thus index + 1 signifies the overall rank of the user
    const { user } = useContext(AuthContext)
    const [ leaderboard, setLeaderboard ] = useState(null)

    useEffect(() => {
        props.getLeaderboard().then(function(result){
            setLeaderboard(result)
        })
    }, [])

    function determineRandom(){
        return Math.floor((Math.random() * 3) + 1);
    }

    return(
        <Row className="leaderboard-container">
            <Col className="le-header-container" span={24}>
                <h1>
                    <FontAwesomeIcon style={{color: 'gold' }} icon={faTrophy} size="lg" />
                    &nbsp;&nbsp;Leaderboard
                </h1>            
            </Col>

            <Col span={24}>
                {leaderboard != null ? 
                <List className="le-list">
                    {leaderboard.map((ranking,index) => 
                        <List.Item key={index} className="item" style={{ background: ranking._id == user._id ? "#f2ebe4" : "none"}}>
                            <Col offset={1} span={1}>
                                {determineRandom()== 1 ? 
                                    <FontAwesomeIcon style={{ color: 'green', fontSize: '16px' }} icon={faCaretUp} />
                                    : determineRandom() == 2 ? <FontAwesomeIcon style={{ color: 'red', fontSize: '16px' }} icon={faCaretDown} /> 
                                    : <FontAwesomeIcon style={{ color: 'gray', fontSize: '12px' }} icon={faEquals} /> 
                                }   
                                &nbsp;&nbsp;&nbsp;{index + 1}
                            </Col>
                            <Col offset={1} span={5}>{ranking.username} &nbsp; [{ranking.firstName} {ranking.lastName}]</Col>
                            <Col span={6}>{ranking.points} points accumulated</Col>
                            <Col span={5}><span style={{ color: ranking.gamesWon > 0 ? 'green' : 'red' }}>{ranking.gamesWon}</span> successes in <span style={{color: '#242425'}}>{ranking.gamesPlayed} </span>games</Col>
                            <Col span={4}>{ranking.level}</Col>
                        </List.Item>
                    )}
                </List>
                : null}
            </Col>
        </Row>
    )
}