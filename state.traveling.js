var stateTraveling = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!Memory.Hivemind.roomInfo[creep.room.name] || Memory.Hivemind.roomInfo[creep.room.name].time > Game.time || !Memory.Hivemind.roomInfo[creep.room.name].time)
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
            Memory.Hivemind.roomInfo[creep.room.name].time = Game.time+ 1000000;
            Memory.Hivemind.roomInfo[creep.room.name].hasLoot = creep.room.storage && _.sum(creep.room.storage.store) > 100;
            Memory.Hivemind.roomInfo[creep.room.name].sourceKeeper =  creep.room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_KEEPER_LAIR}}).length
            
        }
        //1.If at target room,change state to default
        if(creep.room.name == creep.memory.targetRoom && creep.pos.x != 0 && creep.pos.y != 0 && creep.pos.x != 49 && creep.pos.y != 49)
        {
            
            if(creep.memory.travelPath && creep.memory.travelPath.length > 1)
            {
                creep.memory.travelPath = _.drop(creep.memory.travelPath,1)
                creep.memory.targetRoom = creep.memory.travelPath[0];
                console.log(creep,"Next room on path")
            }
            else
            {
                creep.memory.state = creep.memory.defaultState;
                creep.memory.targetRoom = false;
                console.log(creep,"State returned to default")
            }
        }
        else if(creep.memory.targetRoom == 0 || !creep.memory.targetRoom || creep.memory.targetRoom.includes('-'))
        {
            console.log(creep,"Invalid target")
            creep.memory.targetRoom = false;
            creep.memory.state = creep.memory.defaultState;
        }
        //2. Else move to target room
        else
        {
            if(creep.memory.travelPath && creep.memory.travelPath.length)
            {
                creep.memory.targetRoom = creep.memory.travelPath[0];
            }
            //console.log(creep,creep.memory.targetRoom)
            var targetPos = new RoomPosition(20,20,creep.memory.targetRoom)
             var t = Game.getObjectById(creep.memory.target)
            if(creep.memory.defaultState == "hauling" && creep.memory.targetRoom == creep.memory.home)
            {
                targetPos = Game.rooms[creep.memory.home].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})[0]
            }
            else if(creep.memory.defaultState == "hauling" && t)
            {
               targetPos = t.pos;
                
            }
            else if(Memory.Hivemind.roomInfo[creep.memory.targetRoom] && Memory.Hivemind.roomInfo[creep.memory.targetRoom].controllerPosX)
            {
                targetPos =new RoomPosition(Memory.Hivemind.roomInfo[creep.memory.targetRoom].controllerPosX,Memory.Hivemind.roomInfo[creep.memory.targetRoom].controllerPosY,creep.memory.targetRoom)
            }
            
            //console.log(creep)
            var obstacles = _.filter(Game.flags,(f)=>f.name.startsWith("Obstacle"));
            if(creep.memory.defaultState == "raiding" && creep.room.name == creep.memory.targetRoom)
            {
                creep.moveTo(targetPos,{visualizePathStyle: {stroke: '#ff0000'}, ignoreDestructibleStructures:true});
            }
            else
            {
                var result = creep.moveTo(targetPos,{visualizePathStyle: {stroke: '#ff0000'}})//,obstacles:obstacles,maxRooms:2});
                if(result == ERR_NO_PATH)
                {
                    creep.memory.targetRoom =false;
                }
            }

        }
    }
};

module.exports = stateTraveling;