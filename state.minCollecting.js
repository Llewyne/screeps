var stateMinCollecting = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var mineral = creep.room.find(FIND_MINERALS)[0];
        if(_.sum(creep.carry) == creep.carryCapacity || _.sum(creep.carry) >100)
        {
            creep.memory.state = "minDropOff";
        }
        else
        {
            var droppedMinerals = creep.room.find(FIND_DROPPED_RESOURCES,{filter:(r)=>r.resourceType != RESOURCE_ENERGY});
            if(droppedMinerals.length)
            {
                //console.log(creep,"test2")
                if(creep.pickup(droppedMinerals[0]) == ERR_NOT_IN_RANGE)
                {
                    creep.travelTo(droppedMinerals[0], {visualizePathStyle: {stroke: '#7EBF9C'}});
                }
            }
            else
            {
                var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>(s.structureType==STRUCTURE_CONTAINER ||s.structureType==STRUCTURE_STORAGE)&& s.store[mineral.mineralType]});
                if(containers.length)
                {
                    if(creep.withdraw(containers[0],mineral.mineralType) == ERR_NOT_IN_RANGE)
                    {
                        creep.travelTo(containers[0], {visualizePathStyle: {stroke: '#7EBF9C'}});
                    }
                }
                else if(creep.pos.getRangeTo(mineral) > 4)
                {
                    //console.log(creep)
                    creep.moveTo(mineral, {visualizePathStyle: {stroke: '#7EBF9C'}});
                }
            }
        }
		
    }
};

module.exports = stateMinCollecting;