var stateMining = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
               
        if(_.sum(creep.carry)== creep.carryCapacity && creep.memory.defaultState!= "mining")
        {
            creep.memory.state = creep.memory.defaultState;
        }
        
        //1. 	if no assigned source => choose one
        var source;
        var biggerMiner = _.filter(Game.creeps,(c)=>c.ticksToLive>100 && c.room == creep.room && _.filter(c.body,(bp)=>bp.type ==WORK) > _.filter(creep.body,(bp)=>bp.type ==WORK) && (c.memory.defaultState == "mining" || c.memory.defaultState == "farMining"))
        //console.log(creep,biggerMiner)
        //if(creep.room.name == "E28N57")console.log(creep.room,biggerMiner);
        if(biggerMiner.length && creep.memory.defaultState =="hauling")
        {
            creep.memory.state =""
        }
        else if(!creep.memory.source || (biggerMiner.length && creep.hits < 700))
        {
            
            //Pick a source
            creep.say("picking")
            //Take closest source in room that does not have a miner yet
            var sources = creep.room.find(FIND_SOURCES,{filter: function(object) { return !_.some(Game.creeps,(c)=>c.memory.state == "mining" && c.memory.source == object.id && c.ticksToLive > 100 && c.hits >= creep.hits && c.id != creep.id);}});
            //console.log(creep,sources,creep.memory.source)
            source = creep.pos.findClosestByRange(sources);
            if(!source) source = sources[0];
            //if(!source) creep.memory.source = '59f1a4f182100e1594f3dc89';

            
            //If there is only one source move out of the way for bigger miner
            if(biggerMiner.length && (creep.room.find(FIND_SOURCES).length ==1 || (source && creep.memory.source == source.id) || !creep.memory.source))
            {
                //console.log(creep,biggerMiner,"bigger miner",source)
                if((creep.pos.getRangeTo(source) < 4 && biggerMiner[0].pos.getRangeTo(source)<3) ||!source)
                {
                    var containers = creep.room.find(FIND_STRUCTURES,{filter: function(object) {return object.structureType == STRUCTURE_CONTAINER && object.pos.findInRange(FIND_SOURCES,1)}});
         
                    if(containers.length)
                    {
                        var spawn = Game.rooms[creep.memory.home].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})[0];
                       
                        path = hivemind.findRoad(containers[0].pos,spawn.pos);
                        path = _.map(path.road.path,(p)=> new RoomPosition(p.x,p.y,p.roomName));
                        var closest = _.sortBy(path,(p)=>p.getRangeTo(creep))
                        closest = _.filter(closest,(c)=>Game.rooms[c.roomName] && !_.filter(c.lookFor(LOOK_STRUCTURES),(s)=>s.structureType==STRUCTURE_ROAD).length && !_.filter(c.lookFor(LOOK_CONSTRUCTION_SITES)).length && c.x>0 && c.y>0 && c.x<49&&c.y<49);
                       if(closest.length>2)
                       {
                            creep.memory.state = "roadBuilding"
                            creep.memory.roadTarget = containers[0].pos;
                            creep.memory.roadOrigin = spawn.pos;
                       }
                    }
                    else{
                        creep.moveTo(creep.room.controller)
                    }
                
                }
            }
            else if(source)
            {
                creep.memory.source = source.id;
            }
        }
        else
        {
            source = Game.getObjectById(creep.memory.source);
            
            //Make sure creep doesnt get stuck if there is no space
            var source_ = [];
            source_[0] = source; 
            if(creep.pos.findClosestByPath(source_) == null)
            {
                creep.say("unstuck")
                creep.memory.source = false;
                creep.memory.state = creep.memory.defaultState;
            }
        }
        if(source)
        {
    		//2. 	if at assigned source => harvest it
    		var result = creep.harvest(source)
    		var containers = creep.room.find(FIND_STRUCTURES,{filter: function(object) {return object.structureType == STRUCTURE_CONTAINER && source&& source.pos.inRangeTo(object,1) && _.sum(object.store) < object.storeCapacity}});
    		//console.log(creep,containers,creep.pos.isEqualTo(containers[0].pos))
    		//2. 	if at assigned source => harvest it
    		
    		if(containers.length && !creep.pos.isEqualTo(containers[0].pos) && !containers[0].pos.lookFor(LOOK_CREEPS).length) {
    		//      
    		            target = containers[0];
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if(result == ERR_NOT_IN_RANGE) {
		//      else move to assigned source
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
		    }
                
    
            else if((result == 0 && creep.memory.defaultState != "mining" && creep.carryCapacity == creep.carry) || (result!= 0 && creep.memory.defaultState != "mining"))
            {
                creep.memory.state = creep.memory.defaultState;
            }
         }
        //3.    if inventory, fill link
        if(creep.carry[RESOURCE_ENERGY] > 0 && creep.memory.defaultState == "mining")
        {
            var links = creep.room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_LINK}});
            if(links.length)
            {
                var link = creep.pos.findClosestByRange(links);
                if(creep.transfer(link,RESOURCE_ENERGY) !=0)
                {
                    creep.drop(RESOURCE_ENERGY);
                }
            }
            else
            {
                creep.drop(RESOURCE_ENERGY);
            }
        }
        
        //3.    build container
                //console.log(creep,creep.pos)
                var containers = creep.room.find(FIND_STRUCTURES,{filter: function(object) {return object.structureType == STRUCTURE_CONTAINER && object.pos.findInRange(FIND_SOURCES,1)}});
         
                var energy = creep.room.lookForAt(LOOK_ENERGY,creep.pos)
                var amountSites =Object.keys(Game.constructionSites).length;
                if(!containers.length && source && ((energy.length && energy[0].amount>200) || (creep.room.energyCapacity ==creep.room.energyCapacityAvailable && !room.storage)) && amountSites <= 90)
                {
                    var sites = creep.room.find(FIND_CONSTRUCTION_SITES,{filter: function(object) {return object.structureType == STRUCTURE_CONTAINER && source.pos.isNearTo(object)}});
        	        //console.log(creep,sites)
        	        if(!sites.length)
        	        {
        	            if(creep.pos.isNearTo(source))
        	            {
        	                creep.room.createConstructionSite(creep,STRUCTURE_CONTAINER);
        	            }
        	        }
        	        else
        	        {
        		        creep.memory.buildTarget = sites[0].id;
        		        creep.memory.state = "building";
        	        }
                }
                //4.    build road
                else if(containers.length && (containers[0].store[RESOURCE_ENERGY]>1000 || biggerMiner.length) && amountSites <= 90)
                {
                    var spawn = Game.rooms[creep.memory.home].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})[0];
                   
                    path = hivemind.findRoad(containers[0].pos,spawn.pos);
                    path = _.map(path.road.path,(p)=> new RoomPosition(p.x,p.y,p.roomName));
                    var closest = _.sortBy(path,(p)=>p.getRangeTo(creep))
                    closest = _.filter(closest,(c)=>Game.rooms[c.roomName] && !_.filter(c.lookFor(LOOK_STRUCTURES),(s)=>s.structureType==STRUCTURE_ROAD).length && !_.filter(c.lookFor(LOOK_CONSTRUCTION_SITES)).length && c.x>0 && c.y>0 && c.x<49&&c.y<49);
                   if(closest.length>2)
                   {
                        creep.memory.state = "roadBuilding"
                        creep.memory.roadTarget = containers[0].pos;
                        creep.memory.roadOrigin = spawn.pos;
                        
                        if(energy.length)creep.pickup(energy[0])
                        else creep.withdraw(containers[0],RESOURCE_ENERGY);
                   }
                       
                }
                
        
    }
};

module.exports = stateMining;