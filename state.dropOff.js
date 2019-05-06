var stateDropOff = {
    //TODO: transfer to multiple targets in same tick if possible
    
    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        var target = Game.getObjectById(creep.memory.dropTarget);
        
        //1.	select dropOff target
        if(!creep.memory.dropTarget && _.sum(creep.carry)) 
        {
            var fillers = _.filter(Game.creeps,(c)=>c.room.name == creep.memory.home && c.memory.defaultState == "filling");
            var transferers = _.filter(Game.creeps,(c)=>c.room.name == creep.memory.home && c.memory.defaultState == "transfering");
            if(creep.memory.defaultState == "filling")
            {
                var fillPriority = [STRUCTURE_EXTENSION,STRUCTURE_SPAWN,STRUCTURE_TOWER];
                
                for(var structure in fillPriority)
                {
     
                    //console.log(creep,fillPriority[structure])
                    var targets = creep.room.find(FIND_STRUCTURES,{filter: (s) => 
                    !(s.structureType == STRUCTURE_TERMINAL && s.store[RESOURCE_ENERGY]>150000) 
                    && (!s.owner || s.my)
                    && s.structureType == fillPriority[structure] 
                    && ((s.energyCapacity && s.energy < s.energyCapacity) || (s.storeCapacity && _.sum(s.store) < s.storeCapacity))
                    
                    })
                    if(targets.length) {
                        //console.log(creep,targets)
                        var closest = creep.pos.findClosestByRange(targets); //Take target closest to creep
                        if(!closest) closest = targets[0]; //If there is no closest target, take the first of the list
                        if(fillPriority[structure] != STRUCTURE_LINK || creep.pos.getRangeTo(closest) < 4) //Only go to a link if it is very close
                        {   
                            creep.memory.dropTarget = closest.id;
                            break;
                        }
                    }
                    
                }
                
            }
            else if(creep.room.controller.level >= 5 && fillers.length)
            {
                var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER && creep.room.controller.pos.getRangeTo(s)<7 && _.sum(s.store)< s.storeCapacity});
                    
                if(creep.room.name == "E25N53" && containers.length)
                {
                    creep.memory.dropTarget = containers[0].id;
                }
                    
                else
                {
                    //Make sure towers are filled
                    var towers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity/4});
                    var towersNotFull = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
                    
                    //console.log(creep,towers)
                    if(towers.length)
                    {
                        creep.memory.dropTarget = _.sample(towers).id;
                    }
                    else if(towersNotFull.length && creep.room.find(FIND_HOSTILE_CREEPS).length)
                    {
                        creep.memory.dropTarget = _.sample(towersNotFull).id;
                    }
                    else{
                        //console.log(creep,"storage",fillers,transferers)
                        var storageDistance = creep.pos.getRangeTo(creep.room.storage);
                        if(hivemind.find({type:'storageLinks',room:creep.room.name}).length) storageDistance +=1000;
                        var links = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_LINK && s.energy < s.energyCapacity && creep.pos.getRangeTo(s)<storageDistance})
                        //console.log(creep,storageDistance,links)
                        if(links.length)
                        {
                            var closest = creep.pos.findClosestByRange(links);;
                            if(!closest ) closest=links[0];
                            creep.memory.dropTarget = closest.id
                        }
                        else if (creep.room.storage)
                        {
                            creep.memory.dropTarget = creep.room.storage.id;
                        }
                    }
                }
            }
            else
            {
                //console.log(creep,creep.room.controller.level,fillers,transferers)
                var fillPriority = [STRUCTURE_LINK,STRUCTURE_EXTENSION,STRUCTURE_SPAWN,"linkContainer",STRUCTURE_TOWER,STRUCTURE_LAB,STRUCTURE_TERMINAL,STRUCTURE_STORAGE,STRUCTURE_CONTAINER];
                if(creep.room.find(FIND_HOSTILE_CREEPS).length) fillPriority = [STRUCTURE_TOWER].concat(fillPriority);
                
                for(var structure in fillPriority)
                {
                    if(fillPriority[structure] == "linkContainer")
                    {
                        var links = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LINK && creep.room.controller.pos.getRangeTo(s)<7});
                        var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER && creep.room.controller.pos.getRangeTo(s)<7 && _.sum(s.store)< s.storeCapacity});
            
                        if(!(links.length && containers.length)) continue;
                        
                        creep.memory.dropTarget =  containers[0].id;
                    }
                    else
                    {
                        //console.log(creep,fillPriority[structure])
                        var targets = creep.room.find(FIND_STRUCTURES,{filter: (s) => 
                        !(s.structureType == STRUCTURE_TERMINAL && s.store[RESOURCE_ENERGY]>150000) 
                        && (!s.owner || s.my)
                        && s.structureType == fillPriority[structure] 
                        && ((s.energyCapacity && s.energy < s.energyCapacity) || (s.storeCapacity && _.sum(s.store) < s.storeCapacity))
                        && (!s.structureType == STRUCTURE_CONTAINER || !s.pos.findInRange(FIND_SOURCES,1).length) 
                        })
                        if(targets.length) {
                            //console.log(creep,targets)
                            var closest = creep.pos.findClosestByRange(targets); //Take target closest to creep
                            if(!closest) closest = targets[0]; //If there is no closest target, take the first of the list
                            if(fillPriority[structure] == STRUCTURE_TOWER)
                            {
                                closest = _.sample(targets);
                            }
                            if(fillPriority[structure] != STRUCTURE_LINK || creep.pos.getRangeTo(closest) < 4) //Only go to a link if it is very close
                            {   
            
                                creep.memory.dropTarget = closest.id;
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        //console.log(creep,creep.memory.dropTarget)
        var target = Game.getObjectById(creep.memory.dropTarget);
        
        if(!target) 
        {
            creep.drop(RESOURCE_ENERGY);
            creep.memory.state = creep.memory.defaultState;
        }
		//2.	if at target => drop off,set state to previous
		if(target && ((target.energyCapacity && target.energy == target.energyCapacity)||(target.storeCapacity && _.sum(target.store)==target.storeCapacity)))
		{
		    creep.memory.dropTarget = "";
		    creep.say("target full")
		    }
	    else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		    //3.	move to target
                    creep.travelTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
        else if(_.sum(creep.carry) > 0 && creep.carry[RESOURCE_ENERGY] === 0)
        {
            creep.memory.dropTarget = "";
            creep.memory.state = "minDropOff";
        }
        else if(_.sum(creep.carry) === 0)
        {
            creep.memory.dropTarget = "";
            creep.memory.state = creep.memory.defaultState;
        }
        else
        {
            creep.memory.dropTarget ="";
        }

		
    } 
};
module.exports = stateDropOff;

