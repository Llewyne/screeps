var stateBuilding = {

    /** @param {Creep} creep **/
    run: function(creep,Hivemind) {
        //Build priority queue
        var buildPriority = [STRUCTURE_TOWER,STRUCTURE_SPAWN,STRUCTURE_RAMPART,STRUCTURE_WALL,STRUCTURE_EXTENSION,STRUCTURE_ROAD,STRUCTURE_LINK,STRUCTURE_EXTRACTOR,STRUCTURE_CONTAINER,STRUCTURE_STORAGE,STRUCTURE_TERMINAL,STRUCTURE_LAB,STRUCTURE_ROAD];

        if(creep.carry[RESOURCE_ENERGY] === 0)
       {
           creep.memory.state = "collecting";
           var dropped = _.sum(Hivemind.find({type:'resources',room:creep.room.name}),'amount');
           
           if(!creep.room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}}).length && creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY]>0)
           {
               creep.memory.target = creep.room.terminal.id;
           }
           
           var containers = creep.room.find(FIND_STRUCTURES,{filter:function(s){return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]> 50}});
           //console.log(creep,containers)
           if(dropped <50&& !containers.length && (!_.filter(Game.spawns,(s)=>s.room == creep.room).length || !_.filter(Game.creeps,(c)=>c.memory.defaultState == "mining" && c.memory.home == creep.room.name).length))
           {
               creep.memory.state = "mining";
           }
           if(creep.memory.defaultState != "building") creep.memory.state = creep.memory.defaultState;
       }
       else
       {
           var target = Game.getObjectById(creep.memory.buildTarget);
           var spawnConstruct = Game.rooms[creep.memory.home].find(FIND_CONSTRUCTION_SITES,{filter:{structureType:STRUCTURE_SPAWN}});
	        if(target){
	            var result =creep.build(target)
	            if(result == ERR_NOT_IN_RANGE) {
	                var obstacles = _.filter(Game.flags,(f)=>f.name.startsWith("Obstacle"));
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});//,obstacles:obstacles,restrictDistance:40});
                    }
                else if(result != 0 || creep.memory.defaultState == "farMining")
                {
                    creep.memory.buildTarget = false;
                    creep.memory.state = creep.memory.defaultState;
                }
	        }
	        else if(!Game.rooms[creep.memory.home].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}}).length && spawnConstruct.length)
	        {
	            creep.memory.buildTarget = spawnConstruct[0].id;
	        }
	        else
	        {
	           creep.memory.buildTarget = false;
	           var targets = _.filter(Game.constructionSites,(site) => site.structureType == STRUCTURE_SPAWN && site.room && site.room.name != creep.memory.home && Game.map.getRoomLinearDistance(site.room.name,creep.memory.home) ==1 && site.room.controller.level >Game.rooms[creep.memory.home].controller.level);
                    
                    //console.log(creep,targets)
                    if(targets.length) {
                        var closest = creep.pos.findClosestByRange(targets);
                        if(!closest) closest = targets[0];
                        creep.memory.buildTarget = closest.id;
                    }
                    
                    else
                    {
                       for(var structure in buildPriority)
                        {
                            
                	        targets = _.filter(Game.constructionSites,(site) => site.structureType == buildPriority[structure] && site.room && site.room.name == creep.memory.home);
                            targets.sort(function(a, b){return b.progress - a.progress;});

                            //console.log(creep,targets)
                            if(targets.length) {
                                //var closest = creep.pos.findClosestByRange(targets);
                                if(!closest) closest = targets[0];
                                creep.memory.buildTarget = closest.id;
                                break; 
                            }
                        }
                        
                        //Consider construction in other rooms
                        if(!creep.memory.buildTarget)
                        {
                            targets = _.filter(Game.constructionSites,(site) => site.structureType == STRUCTURE_SPAWN && site.room && site.room.name != creep.memory.home && Game.map.getRoomLinearDistance(site.room.name,creep.memory.home) <4);
                            //console.log(creep,targets)
                            if(targets.length) {
                                var closest = creep.pos.findClosestByRange(targets);
                                if(!closest) closest = targets[0];
                                creep.memory.buildTarget = closest.id;
                            }
                            else
                            {
                                creep.memory.state = creep.memory.defaultState;
                                if(creep.memory.state == "building") 
                                {
                                    var road = Hivemind.pickRoadBuild(creep.room.name);
                                    if(road) 
                                    {
                                        creep.memory.state = "roadBuilding"
                                    }
                                    else creep.memory.state = "upgrading"
                                }
                            }
                        }
                    }
           }
       }
    }
};

module.exports = stateBuilding;