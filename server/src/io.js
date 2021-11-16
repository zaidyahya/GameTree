const socketio = require('socket.io');
const Lobby = require('./models/Lobby.js');
const User = require('./models/User.js');
const { Tournament } = require('./models/Tournament.js');
const { Match } = require('./models/Tournament.js');
const { Chat } = require('./models/Chat.js');


const initializeIO = (server) => {
    const io = socketio(server)

    io.on('connection', (socket) => {
        console.log(`We have a new connection with id=${socket.id}`)
        //console.log(socket.handshake.query)

        // Check if the user is already in a lobby
        // Required for when user exits the app, but session is still valid
        checkUserInLobby(socket.handshake.query.userId).then( function(result) {
            if(result != null) {
                socket.emit('existsInLobby', result, function(res){
                    if(res.response) { //ConfirmationDialog response from front-end
                        socket.join(result.lobby._id) //Don't need to do anything else because user is already in the lobby/tournament
                    }
                    else {
                        removeUserFromLobby(socket.handshake.query.userId, result.lobby._id).then( function(updatedLob){
                            //Remove the player from the socket room so future events aren't sent
                            socket.leave(result['lobby']._id)
                            if(result['tournament'] == null) { //If the game hasn't started, then send a lobby update back
                                io.to(updatedLob._id).emit('updatedLobbyState', updatedLob)
                                
                                Lobby.find({ isActive: true }, function(err, lobbies){
                                    socket.broadcast.emit('allLobbies', lobbies)
                                    console.log("ALL LOBBIES SENT (joinLobby)")
                                })
                            }
                        })                        
                    }
                })
            }
        })

        socket.on('getLobbies', function(callback){
            console.log('getLobbies emitted')
            Lobby.find({ isActive: true }, function(err, lobbies){
                callback({status: true, data: lobbies})
            })
        })
        
        socket.on('createLobby', function(lobby, callback){
            console.log(`createLobby emitted`)
                
            Lobby.create( lobby, function(err, newLob){
                var newChat = { lobbyId: newLob._id, tournamentName: newLob.name }
                Chat.create( newChat, function(err, chat){
                    console.log(chat)                    
                    callback({status: true, data: newLob})
                })

                Lobby.find({ isActive: true }, function(err, lobbies){
                    io.emit('allLobbies', lobbies)
                    console.log('ALL LOBBIES SENT (createLobby)')
                })
            })

        })

        socket.on('joinLobby', function(id, callback){
            console.log(`joinLobby emitted` + id)

            User.findOne({_id: {$eq: socket.handshake.query.userId} }, function(err, user){
                console.log(user)
                Lobby.findOneAndUpdate(
                    { _id: id },
                    { $push: 
                        { players: 
                            { username: user.username, userId: user._id, level: user.level, ranking: user.ranking }
                        }
                    },
                    { new: true, useFindAndModify: false }, //options
                    function(err, updatedLob){
                        // Send new lobby state to existing lobby members
                        io.to(updatedLob._id).emit('updatedLobbyState', updatedLob)
                        // Send it to client requestor
                        callback({status: true, data: updatedLob})
                        // Put client requestor in lobby room
                        socket.join(updatedLob._id)

                        Chat.findOne({ lobbyId: updatedLob._id }, function(err, chat){
                            io.to(updatedLob._id).emit('updatedChatState', chat)
                        })

                        // Send all lobbies state to everyone except client requestor because they have already received it
                        // Client requestor will eventually get updated state of lobby if they move back to Home
                        // Idea of this is to cater to those that are still in the lobby, so they see updated state of all lobbies
                        Lobby.find({ isActive: true }, function(err, lobbies){
                            socket.broadcast.emit('allLobbies', lobbies)
                            console.log("ALL LOBBIES SENT (joinLobby)")
                        })
                    } 
                )
            })
        })

        socket.on('leaveLobby', async function(user, lobbyId, callback){
            const lobby = await Lobby.findById(lobbyId)

            lobby['players'] = lobby['players'].filter(p => p['userId'] != user._id)
            socket.leave(lobby._id)
            callback({status: true})

            var isHost = lobby['hostId'] == user._id

            if(lobby['players'].length == 0){ //If no players are left, delete this lobby
                await Lobby.deleteOne({ _id: lobbyId })
            }
            else { //Players are left
                if(isHost){ //If the host was removed, reassign the host
                    lobby['hostId'] = lobby['players'][0]['userId']
                }

                const updatedLobby = await lobby.save()

                io.to(updatedLobby._id).emit('updatedLobbyState', updatedLobby)
            }

            Lobby.find({ isActive: true }, function(err, lobbies){ //Send the new active lobbies back to everyone
                socket.broadcast.emit('allLobbies', lobbies)
                console.log("ALL LOBBIES SENT (joinLobby)")
            })
        })

        socket.on('startGame', function(lobbyId, callback){
            console.log('Start Game emitted')

            Lobby.findById(
                lobbyId,
                function(err, lobby){
                    var newTournament = createTournament(lobby, socket.id)
                    Tournament.create( newTournament,
                        function(err, newTour){
                            callback({status: true, data: newTour})

                            socket.broadcast.to(lobbyId).emit('gameStarted', newTour)

                            Lobby.findByIdAndUpdate(
                                lobbyId,
                                { isGameStarted : true },
                                { new: true, useFindAndModify: false},
                                function(err, updatedLob){
                                    io.to(updatedLob._id).emit('updatedLobbyState', updatedLob)

                                    Lobby.find({ isActive: true }, function(err, lobbies){
                                        socket.broadcast.emit('allLobbies', lobbies)
                                        console.log("ALL LOBBIES SENT (startGame)")
                                    })

                                }
                            )
                        })
                }
            )
        })

        socket.on('newDisputeFromPlayer', function(dispute, callback){
            console.log('newDisputeFromPlayer emitted', dispute)

            Tournament.findByIdAndUpdate(
                dispute.tournamentId,
                { $push:
                    {
                        disputes: dispute
                    }
                },
                { new: true, useFindAndModify: false },
                function(err, tournament){
                    socket.to(tournament.hostSocket).emit('disputeRequestToAdmin', tournament)
                    callback({ status: true })
                }
            )
        })

        socket.on('decisionFromAdmin', async function(decision, dispute){
            console.log('decisionFromAdmin emitted', decision, dispute)
            const tournament = await Tournament.findById(dispute.tournamentId)

            var treeString
            var matchToEdit
            if(dispute.side == 'right' || dispute.side == 'left'){
                treeString = dispute.side + 'Draw'
                const matches = tournament[treeString][dispute.roundName]
                matchToEdit = matches.find(element => element._id == dispute.matchId)
            }
            else {
                matchToEdit = tournament.final
            }
            
            if(decision) {
                matchToEdit[dispute.playerNumber]['score'] = dispute.value
            }
            matchToEdit[dispute.playerNumber]['disputesLeft'] -= 1

            const disputeToEdit = tournament['disputes'].find(element => element._id == dispute._id)
            disputeToEdit['isResolved'] = true
            
            tournament.markModified(treeString)
            tournament.markModified('disputes')
            const updatedTournament = await tournament.save()

            //callback({ status: true })
            io.in(updatedTournament.lobbyId).emit('updatedTournamentState', updatedTournament)

        })

        //Which index for the next round is done easily by module because in the front-end I am changing the positions of the matches i.e. index 0 and 2 are connected, 1 and 3 are connected
        socket.on('matchDecisionFromAdmin', async function(matchIdentifier, match){
            const tournament = await Tournament.findById(matchIdentifier.tournamentId)

            var treeString  
            var matchToEdit
            var matches
            if(matchIdentifier.side == 'right' || matchIdentifier.side == 'left'){
                treeString = matchIdentifier.side + 'Draw'
                matches = tournament[treeString][matchIdentifier['roundName']]
                matchToEdit = matches.find(element => element._id == match._id)
            }
            else { 
                matchToEdit = tournament.final
            }

            matchToEdit['playerOne'].score = match['playerOne'].score
            matchToEdit['playerTwo'].score = match['playerTwo'].score
            const winner = determineWinnerAndSetProperties(matchToEdit) //Doing by reference
            //console.log("Winner is", winner) //console.log(matchToEdit)

            if(matchIdentifier.side == 'right' || matchIdentifier.side == 'left'){ //Because if it is the final then there no next match needs to be set
                var index = matches.indexOf(matchToEdit)
                //console.log(match._id == matchToEdit._id) //console.log("The index is ", index)

                var nextRoundDetails = getNextRoundNameAndModuler(matchIdentifier['roundName'])
                if( nextRoundDetails['name'] == 'final' ){ //If the next is round the final, we need to access a different property of the tournament object
                    nextMatch = tournament.final
                }
                else {
                    const nextRoundMatches = tournament[treeString][nextRoundDetails['name']]
                    var nextMatch = nextRoundMatches[ index % nextRoundDetails['coefficient'] ]
                }
                setPlayerInMatch(nextMatch, winner) //Doing by reference
                //console.log(nextMatch)
            }
            else { //If it is the final, set the properties for the user because determineWinnerAndSetProperties doesn't take care of it
                User.findByIdAndUpdate(winner['userId'], 
                    { $inc:
                        {
                            gamesPlayed: 1,
                            gamesWon: 1
                        }
                    },
                    { new: true, useFindAndModify: false },
                    function(err, user){
                        if(err) //console.log(err) 
                        if(!user){
                            console.log("No User found while setting gamesWon")
                        } else {
                            console.log("User was found while setting gamesWon")
                        }
                    })

                User.findByIdAndUpdate(tournament['hostId'],
                    { $set:
                        {
                            adminTourShown: true
                        }
                    },
                    { new: true, useFindAndModify: false },
                    function(err, user){
                        if(err) console.log('There was an error updating admin tour')
                    }
                )

                //Set the Lobby as complete
                Lobby.findByIdAndUpdate(tournament['lobbyId'],
                    { $set:
                        {
                            isActive: false
                        }
                    },
                    { new: true, useFindAndModify: false },
                    function(err, lob){
                        if(err) console.log('There was an error (matchDecisionFromAdmin)')
                    }
                )
                //Set the tournament as complete
                tournament.isCompleted = true

            }

            const updatedTournament = await tournament.save()
            io.in(updatedTournament.lobbyId).emit('updatedTournamentState', updatedTournament)

        })

        socket.on('newChatMessage', function(messageObj){
            console.log('Received', messageObj)
            const newMessage = { username: messageObj['username'], userId: messageObj['userId'], content: messageObj['content'] }

            Chat.findByIdAndUpdate(messageObj['chatId'],
                { $push:
                    {
                        messages: newMessage
                    }
                },
                { new: true, useFindAndModify: false },
                function(err, updatedChat){
                    if(err){
                        console.log(err)
                    }
                    else {
                        io.to(updatedChat.lobbyId).emit('updatedChatState', updatedChat)
                    }
                }
            )
        })

        socket.on('getLeaderboard', async function(callback){
            console.log('getLeaderboard emitted')

            const users = await User.find({})
            console.log(users)
            
            var sortedByPoints = users.sort((a,b) => -1*(a.points - b.points))
            //console.log(sortedByPoints)
            callback({ data: sortedByPoints })

            users.forEach( async function(user){
                user['ranking'] = sortedByPoints.findIndex(sortedUser => sortedUser._id == user._id) + 1
                if(user['points'] >= 500 && user['points'] < 1000){
                    user['level'] = 'Professional'
                }
                else if(user['points'] >= 1000){
                    user['level'] = 'Expert'
                }
                await user.save()
            })
        })

    }); //Io connection closer

    return io
}

function checkUserInLobby(userId){
    console.log('checkUserInLobby emitted')
    return new Promise(function(resolve, reject){
        Lobby.findOne({ isActive: true, "players.userId": userId }, 
            function(err, lobby){
                if(lobby != null){
                    Chat.findOne( {lobbyId: lobby._id}, function(err, gameChat){
                        if( lobby.isGameStarted ){
                            Tournament.findOne( //Tournament has started
                                { lobbyId: lobby._id, isCompleted: false },
                                function(err, tournament){
                                    console.log('Found tourney')
                                    resolve({ lobby: lobby, chat: gameChat, tournament: tournament})
                                }
                            )
                        }
                        else { //Still in lobby
                            resolve({ lobby: lobby, chat: gameChat, tournament: null})
                        }
                    })
                }
                else {
                    resolve(null)
                }
        })
    })
}

function removeUserFromLobby(user_id, lobbyId){
    return new Promise((resolve, reject) => {
        Lobby.findByIdAndUpdate(
            lobbyId,
            { $pull: 
                { players:
                    { userId: user_id }
                }
            },
            { new: true, useFindAndModify: false },
            function(err, updatedLob){
                if(err){
                    console.log(err)
                }
                console.log(updatedLob)
                resolve(updatedLob)
            }
        )
    })
}

//Nullified this idea, only 3 disputes in every type of game
function determineNumDisputes(roundNumber){
    switch(roundNumber){
        case 1:
            return 3
    }
}

//Returns the next round name and the modulo that determines the appropriate index on the tree for the next match
//The module is essentially the # of games for that round on that side of the tree i.e. 1 for semi as there is 1 side per side of the tree
function getNextRoundNameAndModuler(currRound){
    switch(currRound){
        case 'r32':
            return { 'name': 'rSixteen', 'coefficient': 4 } 
        case 'rSixteen':
            return { 'name': 'quarters', 'coefficient': 2 }
        case 'quarters':
            return { 'name': 'semis', 'coefficient': 1 }
        case 'semis':
            return { 'name': 'final', 'coefficient': -1 }
    }
}

//Updates the properties of the match and user
//Logic is to update points and gamesPlayed properties of User when they are eliminated/progress
function determineWinnerAndSetProperties(match){
    var winningPlayer 
    var losingPlayer
    if(match['playerOne'].score > match['playerTwo'].score){
        winningPlayer = 'playerOne'
        losingPlayer = 'playerTwo'
    }
    else {        
        winningPlayer = 'playerTwo'
        losingPlayer = 'playerOne'
    }
    //Set appropriate match properties
    match[losingPlayer]['isEliminated'] = true
    match['winner'] = match[winningPlayer]['username']
    match['isFinished'] = true
    
    //Set appropriate user properties
    User.findByIdAndUpdate(match[winningPlayer]['userId'], 
            { $inc:
                {
                    points: match[winningPlayer]['score']
                }
            },
            { new: true, useFindAndModify: false },
            function(err, user){
                if(err) //console.log(err) 
                if(!user){
                    console.log("No User found for " + winningPlayer)
                } else {
                    console.log("User was found for " + winningPlayer)
                }
            }
        )

    User.findByIdAndUpdate(match[losingPlayer]['userId'], 
            { $inc:
                {
                    points: match[losingPlayer]['score'],
                    gamesPlayed: 1
                }
            },
            { new: true, useFindAndModify: false },
            function(err, user){
                if(err) //console.log(err) 
                if(!user){
                    console.log("No User found for " + losingPlayer)
                } else {
                    console.log("User was found for " + losingPlayer)
                }
            }
        )

    return JSON.parse(JSON.stringify(match[winningPlayer]))
}

function setPlayerInMatch(match, player){
    if(match['playerOne']['username'].includes('Finalist')){
        match['playerOne']['username'] = player['username']
        match['playerOne']['userId'] = player['userId']
        match['playerOne']['score'] = 0
        match['playerOne']['disputesLeft'] = 3
    }
    else {
        match['playerTwo']['username'] = player['username']
        match['playerTwo']['userId'] = player['userId']
        match['playerTwo']['score'] = 0
        match['playerTwo']['disputesLeft'] = 3
    }
}

function createTournament(lobby, hostSocket){
    console.log("Creating Tournament ..", lobby.size)

    const playersEx = lobby.players.length

    for(var i=0; i<lobby.size - playersEx; i++){
        lobby.players.push({ username: 'Player '+i, userId: -i, score: 0, level: "Amateur" })
    }

    // CONSTANTS
    var dictToUse = getDictionary(lobby.size)
    console.log(dictToUse)
    var tournamentRounds = Math.log2(lobby.size) - 1

    var players = JSON.parse(JSON.stringify(lobby.players))
    shuffle(players)

    const tournament = new Tournament({
        name: lobby.name,
        size: lobby.size,
        hostSocket: hostSocket,
        hostId: lobby.hostId,
        lobbyId: lobby._id
    })

    for(var i=1; i <= tournamentRounds; i++){
        for(var j=0; j < lobby.size/Math.pow(2,i); j++){
            const match = new Match()
            if(i == 1){
                match.playerOne = players[j]
                match.playerOne.disputesLeft = 3
                match.playerTwo = players[j + lobby.size/2]
                match.playerTwo.disputesLeft = 3
            }
            else {
                match.playerOne = { username: getNameFiller(dictToUse[i]) + ' ' + (1+j), userId: "-1", score: 0 }
                match.playerTwo = { username: getNameFiller(dictToUse[i]) + ' ' + (1+j+lobby.size/Math.pow(2,i)), userId: "-1", score: 0 }
            }

            if( j < lobby.size/Math.pow(2, i+1) ){
                tournament.leftDraw[ dictToUse[i] ].push(match)
            }
            else {
                tournament.rightDraw[ dictToUse[i] ].push(match)
            }
        }
    }

    const finalMatch = new Match()
    finalMatch.playerOne = { 'username': 'Finalist Uno' }
    finalMatch.playerTwo = { 'username': 'Finalist Dos' }
    tournament.final = finalMatch

    return tournament

}

function getDictionary(size){
    switch(size){
        case 32:
            return { 1: 'r32', 2: 'rSixteen', 3: 'quarters', 4: 'semis' }
        case 16:
            return { 1: 'rSixteen', 2: 'quarters', 3: 'semis' }
        case 8: 
            return { 1: 'quarters', 2: 'semis' }
    }
}

function getNameFiller(defaultName){
    switch(defaultName){
        case 'rSixteen':
            return 'R16 Finalist'
        case 'quarters':
            return 'Quarter-Finalist'
        case 'semis':
            return 'Semi-Finalist'
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
  
    return array
}

module.exports = { initializeIO };