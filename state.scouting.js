var stateScouting = {

    /** @param {Creep} creep **/
    run: function(creep,Hivemind) {
    
        
        if(!creep.memory.targetRoom || creep.memory.targetRoom==creep.room.name)
        {
            creep.memory.targetRoom = Hivemind.newScoutTarget(creep.room.name);
            console.log(creep.memory.targetRoom)
            if(!creep.memory.targetRoom) 
            {
                creep.memory.targetRoom = _.sample(Hivemind.adjecentRooms(creep.room.name))
            }    
            if(!Memory.Hivemind.roomInfo[creep.memory.targetRoom])Memory.Hivemind.roomInfo[creep.memory.targetRoom] = {};
            
        }
        //console.log(creep.memory.targetRoom)
        if(!Memory.Hivemind.roomInfo[creep.room.name] || Memory.Hivemind.roomInfo[creep.room.name].time > Game.time|| !Memory.Hivemind.roomInfo[creep.room.name].time )
        {
            if(!Memory.Hivemind.roomInfo[creep.room.name]) Memory.Hivemind.roomInfo[creep.room.name] = {};
            Memory.Hivemind.roomInfo[creep.room.name].hasEnergy = creep.room.find(FIND_SOURCES).length;
            if(creep.room.controller)
           {
               Memory.Hivemind.roomInfo[creep.room.name].controllerPosX = creep.room.controller.pos.x;
                Memory.Hivemind.roomInfo[creep.room.name].controllerPosY = creep.room.controller.pos.y;
                if(creep.room.controller.owner)Memory.Hivemind.roomInfo[creep.room.name].owner = creep.room.controller.owner.username;
           }
            Memory.Hivemind.roomInfo[creep.room.name].adjecentRooms = false;
            Memory.Hivemind.roomInfo[creep.room.name].time = Game.time+ 100;
            Memory.Hivemind.roomInfo[creep.room.name].hasLoot = creep.room.storage && _.sum(creep.room.storage.store) > 100;
            Memory.Hivemind.roomInfo[creep.room.name].sourceKeeper =  creep.room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_KEEPER_LAIR}}).length
            
            
            if(creep.room.name == creep.memory.targetRoom)creep.memory.targetRoom = false;
        }
        //3. Else set state to traveling
        if(creep.room.name != creep.memory.targetRoom)
        {
            //console.log(creep,"Move to target room")
            creep.memory.state = "traveling";
        }
    }
};

module.exports = stateScouting;