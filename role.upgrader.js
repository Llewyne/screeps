var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy > 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
	        //reep.say("upgrading")
	        
	        if(Game.rooms[creep.memory.spawnRoom].controller.owner && Game.rooms[creep.memory.spawnRoom].controller.owner.username == "Llewyne")
	        {
	            //creep.say("found controller")
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.flags[Memory.Helper[creep.memory.spawnRoom].controllerDropoff], {visualizePathStyle: {stroke: '#ffffff'}});
                }
	        }
	        else
	        {
	            creep.moveTo(Game.flags["Container1"], {visualizePathStyle: {stroke: '#ffffff'}});
	        }
        }
        else {
            
            var targets = Game.rooms[creep.memory.spawnRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((((structure.structureType == STRUCTURE_STORAGE) &&
                                structure.store.energy) && structure.room.name == creep.memory.spawnRoom) || structure.id == Memory.Helper[creep.memory.spawnRoom].upgradeLink);
                        }
                });
                //console.log(creep.name,Memory.Helper[creep.memory.spawnRoom].upgradeLink,targets)
            if(targets.length)
            {
                //console.log(creep.name,creep.withdraw(targets[0],RESOURCE_ENERGY))
                if(creep.withdraw(targets[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else
            {
                
                var targets = _.filter(Game.creeps,(c)=>c.memory.spawnRoom == creep.memory.spawnRoom && c.memory.targetSource == creep.memory.targetSource && c.memory.role == "miner" && c.memory.mining);
                if(targets.length && targets[0].room == creep.room)
                {
                    if(creep.pickup(creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
                else
                {
                    creep.moveTo(Game.flags[Memory.Helper[creep.memory.spawnRoom].upgradeWait]);
                
                }
            }
        }
	}
};

module.exports = roleUpgrader;