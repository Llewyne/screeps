var stateFarMining = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        //creep.say("hi")
        
        if(!creep.memory.miningRoom)
        {
            creep.memory.targetRoom = hivemind.pickFarSource(creep.memory.home,"farMining");
            creep.memory.miningRoom = creep.memory.targetRoom;
        }
        //console.log(creep,farSources)
        if(_.sum(creep.carry)== creep.carryCapacity && creep.memory.defaultState!= "farMining")
        {
            creep.memory.state = creep.memory.defaultState;
        }
        
        //1. 	if no assigned source => choose one
        var source;
        if(creep.memory.source &&creep.room.find(FIND_CREEPS,{filter:function(c){return c.memory && c.memory.source == creep.memory.source && c.id != creep.id}}).length)
        {
            creep.memory.source = false;
            //console.log(creep)
        }
        if(creep.room.name!= creep.memory.miningRoom)
            {
                creep.memory.targetRoom=creep.memory.miningRoom
                creep.memory.state = "traveling";
            }
        else if(!creep.memory.source)
        {
            
            
                var farSources=Game.rooms[creep.memory.miningRoom].find(FIND_SOURCES);
                //Take closest source in room that does not have a miner yet
                var sources = _.filter(farSources,function(object) { return !_.some(Game.creeps,(c)=>c.memory.state == "farMining" && c.memory.source == object.id);})
                sources = _.filter(sources,(s)=>s!=null)
                //console.log(creep,sources)
                if(sources.length)
                {
                    source = creep.pos.findClosestByRange(sources);
                    if(!source) source = sources[0];
                    creep.memory.source = source.id;
                    
                }
                else
                {
                    creep.memory.miningRoom = false;
                }
            
        }
        else
        {
            source = Game.getObjectById(creep.memory.source);
        }
        
        if(source != null && source.pos.roomName == creep.memory.miningRoom)
        {
            var containers = creep.room.find(FIND_STRUCTURES,{filter: function(object) {return object.structureType == STRUCTURE_CONTAINER && source&& source.pos.inRangeTo(object,1) && _.sum(object.store) < object.storeCapacity}});
    		//console.log(creep,containers)
    		//2. 	if at assigned source => harvest it
    		
    		if(containers.length && !creep.pos.isEqualTo(containers[0].pos)) {
    		//      
    		            target = containers[0];
    		        
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if(creep.harvest(source) == ERR_NOT_IN_RANGE)
            {
                //console.log(creep,"moving")
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            //3.    build container
            //console.log(creep,creep.pos)
            var energy = creep.room.lookForAt(LOOK_ENERGY,creep.pos)
            var amountSites =Object.keys(Game.constructionSites).length;
            if(!containers.length && source && energy.length && energy[0].amount>200 && amountSites <= 90)
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
            else if(containers.length && containers[0].hits < (0.5*containers[0].hitsMax) && creep.carry[RESOURCE_ENERGY])
            {
                creep.say("repair")
                if(creep.repair(containers[0]) ==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(containers[0])
                }
            }
            //4.    build road
            else if(containers.length && containers[0].store[RESOURCE_ENERGY]>1000 && amountSites <= 90)
            {
                //console.log(creep)
                var spawn = Game.rooms[creep.memory.home].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})[0];
           
                path = hivemind.findRoad(source.pos,spawn.pos);
                path = _.map(path.road.path,(p)=> new RoomPosition(p.x,p.y,p.roomName));
                var closest = _.sortBy(path,(p)=>p.getRangeTo(creep))
                closest = _.filter(closest,(c)=>Game.rooms[c.roomName] && !_.filter(c.lookFor(LOOK_STRUCTURES),(s)=>s.structureType==STRUCTURE_ROAD).length && !_.filter(c.lookFor(LOOK_CONSTRUCTION_SITES)).length && c.x>0 && c.y>0 && c.x<49&&c.y<49);
               if(closest.length>2)
               {
                    creep.memory.state = "roadBuilding"
                    creep.memory.roadTarget = source.pos;
                    creep.memory.roadOrigin = spawn.pos;
           }
               
            }
            
        }
        else
        {
            creep.memory.source =false;
        }
		
    }
};

module.exports = stateFarMining;