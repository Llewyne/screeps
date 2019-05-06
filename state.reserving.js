var stateReserving = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        
        
        if(!creep.memory.targetRoom)
        {
            var rooms = _.filter(hivemind.adjecentRooms(creep.room.name),(r)=>!_.filter(Game.creeps,(c)=>c.memory.defaultState=="reserving"&&creep.memory.targetRoom==r).length)
        
            if(!rooms.length)
            {
               rooms = _.filter(hivemind.adjecentRooms(creep.room.name),(r)=>2>_.filter(Game.creeps,(c)=>c.memory.defaultState=="reserving"&&creep.memory.targetRoom==r).length)
    
            }
            
            if(rooms.length) creep.memory.targetRoom = rooms[0];
        }
        
        if(creep.room.name == creep.memory.targetRoom)
        {
            if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
               creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        //3. Else set state to traveling
        else
        {
            //console.log(creep,"Move to target room")
            creep.memory.state = "traveling";
        }
    }
};

module.exports = stateReserving;