var roleMHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        //Set target to mineral
        var target = Game.getObjectById(Memory.Helper[creep.memory.spawnRoom].mineral)
	    if(!target)
	    {
	        target = Game.rooms[creep.memory.spawnRoom].find(FIND_MINERALS)[0];
	        Memory.Helper[creep.memory.spawnRoom].mineral = target.id;
	    }
	    var target =  Game.getObjectById('59757d7d805bb95378e2631e')
	    if(_.sum(creep.carry) == 0) {
	        if(creep.pickup(target) == ERR_NOT_IN_RANGE || creep.pickup(target) == ERR_INVALID_TARGET) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets =[];

                targets = creep.room.find( FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store)) || (structure.structureType == STRUCTURE_TERMINAL && _.sum(structure.store) <  structure.storeCapacity)) //  
                    }
                });
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

module.exports = roleMHarvester;