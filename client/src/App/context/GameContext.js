import React, { createContext, useState } from 'react';
import { Row } from 'antd';

export const GameContext = createContext();

export default ({ children }) => {
    const [ lobbies, setLobbies ] = useState(null)
    const [ lobby, setLobby ] = useState(null)
    const [ chat, setChat ] = useState(null)
    const [ tournament, setTournament ] = useState(null)
   
    return(
        <Row style={{width: "100%", marginTop: "50px", marginBottom: "25px"}}>
            <GameContext.Provider value={{lobbies, setLobbies, lobby, setLobby, chat, setChat, tournament, setTournament}}>
                { children }
            </GameContext.Provider>
        </Row>
    )
}