var roleMMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    var target = Game.getObjectById(Memory.Helper[creep.memory.spawnRoom].mineral)
	    if(!target)
	    {
	        target = Game.rooms[creep.memory.spawnRoom].find(FIND_MINERALS)[0];
	        Memory.Helper[creep.memory.spawnRoom].mineral = target.id;
	    }
        //console.log(harvestResult)
        if(_.sum(creep.carry) > 49)
        {
            var targets =[];

                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store)) || (structure.structureType == STRUCTURE_TERMINAL && _.sum(structure.store) <  structure.storeCapacity)) //  
                    }
                });
            if(targets.length > 0) {
                var closest = creep.pos.findClosestByPath(targets);
                //var resources = _.filter(creep.carry,r=>
                if(creep.transfer(closest,RESOURCE_LEMERGIUM) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else if(creep.harvest(target)  == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#33cc33'}});
            creep.memory.mining = false;
        }
        else
        {
            creep.memory.mining = true;
        }

	}
};

module.exports = roleMMiner;