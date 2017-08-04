var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    var target = Game.getObjectById(Memory.Helper[creep.memory.spawnRoom].sources[creep.memory.targetSource])
	    
	    var flagName = Memory.Helper[creep.memory.spawnRoom].sourceFlags[creep.memory.targetSource];
        if(target)
        {
            var harvestResult = creep.harvest(target) 
            if(harvestResult == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                creep.memory.mining = false;
            }
            else
            {
                creep.memory.mining = true;
            }
        }
        else if(Game.flags[flagName])
        {
            creep.moveTo(Game.flags[flagName], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        
        else
        {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleMiner;