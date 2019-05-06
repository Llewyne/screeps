var stateThieving = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        var targetRoom = hivemind.pickRaidRoom(creep.memory.home);
        if(_.sum(creep.carry) < creep.carryCapacity*0.8)
        {
            if(creep.room.name!= targetRoom)
            {
                creep.memory.targetRoom = targetRoom;
                creep.memory.state = "traveling"
            }
            else if(creep.memory.target)
            {
                var target = Game.getObjectById(creep.memory.target);
                if(target)
                {
                    if(!target.store && !target.energy) creep.memory.target = false;
                    if(!creep.pos.isNearTo(target))
                    {
                        creep.moveTo(target,{visualizePathStyle: {stroke: '#ff0000'}})
                    }
                    if(target.store)
                    {
                        for(r in target.store)
                        {
                            creep.withdraw(target,r)
        
                        }
                    }
                    else if(!(target instanceof Resource)) creep,creep.withdraw(target,RESOURCE_ENERGY)
                    else
                    {
                        creep.pickup(target)
                    }
                }
                
            }
            else 
            {
                var structures = creep.room.find(FIND_STRUCTURES,{filter:(s)=> ((s.energy && s.structureType != STRUCTURE_TOWER)|| (s.store && _.sum(s.store)))});
                if(structures.length) 
                {
                    var target = creep.pos.findClosestByPath(structures,{maxRooms:1})
                    if(target) creep.memory.target = target.id;
                }
                if(!target)
                {
                    var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES,{filter:(r)=>creep.pos.findPathTo(r,{maxRooms:1}).length > 1 &&r.resourceType==RESOURCE_ENERGY});
                    if(droppedEnergy.length)
                    {
                        var target = creep.pos.findClosestByPath(droppedEnergy,{maxRooms:1});
                        if(!target)  target = droppedEnergy[0];
                        creep.memory.target = target.id;
                    }
                    else
                    {
                        Memory.Hivemind.roomInfo[creep.room.name].hasLoot = false;
                    }
            
                }
            }
        }
        else
        {
            if(creep.room.name!= creep.memory.home)
            {
                creep.memory.targetRoom = creep.memory.home;
                creep.memory.state = "traveling"
            }
            else
            {
                creep.memory.state = "dropOff";
            }
        }
        
    }
        
};

module.exports = stateThieving