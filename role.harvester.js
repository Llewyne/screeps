var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy == 0) {
	        var savedTarget = Game.getObjectById(creep.memory.target);
	        if(savedTarget)
	        {
	           
	            if(creep.pickup(savedTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(savedTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
	        }
	        else
	        {
	            
    	        
    	        var targets = _.filter(Game.creeps,(c)=>c.memory.spawnRoom == creep.memory.spawnRoom && c.memory.targetSource == creep.memory.targetSource && c.memory.role == "miner" && c.memory.mining);
                if(targets.length)
                {
                    var closeResources = _.sortBy(targets[0].pos.findInRange(FIND_DROPPED_RESOURCES, 6),(d)=>d.amount);
                    
                    if(creep.pos.inRangeTo(targets[0],6))
                    {
                        
                        if(creep.pickup(closeResources[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closeResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                            creep.memory.target = closeResources[0];
                        }
                    }
                    else
                    {
                        
                        if(!creep.pos.isNearTo(targets[0])) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                            creep.memory.target = targets[0];
                        }
                    }
                }
                else
                {
                    
                    var closeResources = _.sortBy(creep.pos.findInRange(FIND_DROPPED_RESOURCES, 6),(d)=>d.amount);
                    if(Memory.Helper[creep.memory.spawnRoom].harvestWaitFlags[creep.memory.targetSource])
                    {
                       
                        if(!creep.pos.inRangeTo(Game.flags[Memory.Helper[creep.memory.spawnRoom].harvestWaitFlags[creep.memory.targetSource]],5))
                        {
                            creep.moveTo(Game.flags[Memory.Helper[creep.memory.spawnRoom].harvestWaitFlags[creep.memory.targetSource]], {visualizePathStyle: {stroke: '#ffaa00'}});
                            creep.memory.target = Game.flags[Memory.Helper[creep.memory.spawnRoom].harvestWaitFlags[creep.memory.targetSource]];
                        }
                        else
                        {
                            if(creep.pickup(closeResources[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(closeResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                                creep.memory.target = closeResources[0];
                            }
                        }
                    }
                    
                    else if(creep.pickup(closeResources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closeResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                        creep.memory.target = closeResources[0];
                    }
                }
	        }
        }
        else {
            var targets =[];
            if(creep.room.find(FIND_HOSTILE_CREEPS).length)
            {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_TOWER && structure.energy < 10 && structure.my))
                    }
                });
            }
            if(!targets.length)
            {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (((structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.storeCapacity ) || ((((structure.id == '596234654d76880bd1fdb3f1' || structure.id == '59735d9024d33e4abd60d71c' || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                            structure.energy < structure.energyCapacity) || ((structure.structureType == STRUCTURE_STORAGE) && structure.store.energy < structure.storeCapacity)) && structure.my)) && structure.room.name == creep.room.name) //  
                    }
                });
            }
            if(targets.length > 0) {
                var closest = creep.pos.findClosestByPath(targets);
                if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else
            {
                creep.moveTo(Game.flags["Container1"], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleHarvester;