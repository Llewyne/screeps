var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(!creep.memory.targetFlag)
        {
            creep.memory.targetFlag = "Room2Source2"
        }
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        
        var repairTargets = creep.room.find(FIND_STRUCTURES,{ 
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.hitsMax/20 > structure.hits)
            }});
            
        if(targets.length > 0) {
            if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
	    else if(creep.carry.energy < 50) 
	    {
	        var waitFlag = Game.flags[creep.memory.targetFlag];
	        if(creep.room.name != waitFlag.room.name)
	        {
	             creep.moveTo(waitFlag, {visualizePathStyle: {stroke: '#ffaa00'}});
	        }
	        else
	        {
	            var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                                structure.energy > 0) || ((structure.structureType == STRUCTURE_CONTAINER  || structure.structureType == STRUCTURE_STORAGE) && structure.store.energy > 0)) && !structure.my); //  
                        }});

                if(targets.length)
                {
                    
                    var target = creep.pos.findClosestByPath(targets);
                    if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
                else
                {
        	        var closeResources = _.sortBy(creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10),(d)=>d.amount).reverse();
        	        
                    if(waitFlag && closeResources.length)
                    {
                        if(!creep.pos.inRangeTo(waitFlag,10))
                        {
                            creep.moveTo(waitFlag, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                        else
                        {
                            if(creep.pickup(closeResources[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(closeResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        }
                    }
                    
                    else if(creep.pickup(closeResources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closeResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                    else
                    {
                        var sources = creep.room.find(FIND_SOURCES);
                        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                        
                    }
                }
	        }
        }
        else if(repairTargets.length)
        {
            creep.say("repair")
            if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
                        
        }
        else {
            //Build priority queue
            var buildPriority = [STRUCTURE_SPAWN,STRUCTURE_TOWER,STRUCTURE_LINK,STRUCTURE_EXTENSION,STRUCTURE_RAMPART,STRUCTURE_CONTAINER,STRUCTURE_STORAGE,STRUCTURE_ROAD];
    
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
            	        var targets = _.filter(Game.constructionSites,(site) => site.structureType == buildPriority[structure] && site.room  && site.room.name == creep.room.name);
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
        }
	}
};

module.exports = roleHarvester;