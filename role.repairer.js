var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('repair');
	    }

	    if(creep.memory.repairing) {
	        var targets = _.filter(Game.rooms[creep.memory.spawnRoom].find(FIND_STRUCTURES),(target) => target.hits < 999 && target.hits);
            if(targets.length) {
                //console.log(JSON.stringify(targets))
                if(creep.repair(creep.pos.findClosestByPath(targets)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.pos.findClosestByPath(targets), {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else return 0;
	    }
	    else {
	        var closestResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
	        var targets = _.filter(Game.creeps,(c)=>c.memory.targetSource == creep.memory.targetSource && c.memory.role == "miner" && c.memory.mining && c.memory.spawnRoom == creep.memory.spawnRoom);
            if(targets.length)
            {
                if(creep.pickup(closestResource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else
            {
                if(creep.pickup(closestResource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestResource, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
	    }
	}
};

module.exports = roleRepairer;