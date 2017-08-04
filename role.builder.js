var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        //Build priority queue
        var buildPriority = [STRUCTURE_TOWER,STRUCTURE_EXTRACTOR,STRUCTURE_LINK,STRUCTURE_EXTENSION,STRUCTURE_RAMPART,STRUCTURE_WALL,STRUCTURE_CONTAINER,STRUCTURE_STORAGE,STRUCTURE_TERMINAL,STRUCTURE_ROAD];

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy >= 50) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var target = Game.getObjectById(creep.memory.target)
	        if(target){
	            
	            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
	        }
	        else
	        {
	            for(var structure in buildPriority)
	            {
        	        var targets = _.filter(Game.constructionSites,(site) => site.structureType == buildPriority[structure] && site.room && site.room.name == creep.memory.spawnRoom);
                    if(targets.length) {
                        var closest = creep.pos.findClosestByPath(targets);
                        if(!closest) closest = targets[0];
                        creep.memory.target = closest.id;
                        return 1;
                    }
	            }
	            
	            return 0;
	        }
	    }
	    else {
	        var targets = []
	        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable)
	        {
	            targets =  creep.room.find(FIND_STRUCTURES, {
	                  filter: (structure) => {
                        return ((structure.store && structure.store.energy) || structure.energy);
	                  },
	            });
	            
	            
	            targets = _.sortBy(targets, t => creep.pos.getRangeTo(t))
	            
	            //console.log(targets)
	        }
	        if(!targets.length)
	        {
    	        targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                                structure.store.energy) || ((structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) && structure.energy > 200)) && structure.room.name == creep.memory.spawnRoom);
                        }
                });
	        }
            
            
            if(targets.length)
            {
                if(creep.withdraw(targets[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else
            {
                
                creep.moveTo(Game.flags[Memory.Helper[creep.memory.spawnRoom].buildWait]);
            }
	    }
	}
};

module.exports = roleBuilder;