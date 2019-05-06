var stateRedistributing = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var links = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LINK && creep.room.controller.pos.getRangeTo(s)<7});
        var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER && creep.room.controller.pos.getRangeTo(s)<7});
        //console.log(creep,links,containers)
        if(_.sum(creep.carry) === 0)
        {
            if(creep.room.terminal && creep.room.storage)
            {
        
                var target = creep.room.storage;
                if(creep.room.terminal.store[RESOURCE_ENERGY]>creep.room.storage.store[RESOURCE_ENERGY])
                {
                    target = creep.room.terminal;
                }
                if(creep.pos.isNearTo(target))
                {
                    creep.withdraw(target,RESOURCE_ENERGY);
                }
                else
                {
                    creep.travelTo(target);
                }
            }
            else
            {
                creep.moveTo(creep.room.controller)
            }
        }
        //Find upgrade container
        else if(links.length && containers.length)
        {
            if(_.sum(containers[0].store) < 2000)
            {
                creep.memory.dropTarget = containers[0].id;
                creep.memory.state = "dropOff";
            }
        }
        else if(creep.room.terminal && creep.room.storage)
        {
            if(!creep.room.storage.store || creep.room.terminal.store[RESOURCE_ENERGY]>creep.room.storage.store[RESOURCE_ENERGY])
            {
                creep.memory.dropTarget = creep.room.storage.id;
            }
            else if(creep.room.terminal.store[RESOURCE_ENERGY] < 150000)
            {
                creep.memory.dropTarget = creep.room.terminal.id;
            }
            
            creep.memory.state = "dropOff";
        }
        else
        {
            creep.moveTo(creep.room.controller)
        }
        
    }
        
};

module.exports = stateRedistributing;