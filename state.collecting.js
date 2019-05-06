var stateCollecting = {

    /** @param {Creep} creep **/
    run: function(creep,Hivemind) {

        var minEnergy = 50*(creep.room.find(FIND_STRUCTURES,{filter:{stuctureType: STRUCTURE_EXTENSION}}).length+1);
        if(creep.memory.defaultState !="collecting") minEnergy =creep.carryCapacity;
        //console.log(creep)
        //Find a new target
        if(_.sum(creep.carry) < minEnergy && _.sum(creep.carry) < creep.carryCapacity && (!creep.memory.target || creep.memory.collectCountdown < 1))
        {
            creep.say("find target")
            creep.memory.collectCountdown = 3;
            var structures = creep.room.find(FIND_STRUCTURES,{filter:(s)=>((s.structureType==STRUCTURE_LINK && s.energy>0) || ((s.structureType==STRUCTURE_TERMINAL || s.structureType==STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY]>10000))})
            var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]>0});
            var tombstones = creep.room.find(FIND_TOMBSTONES,{filter:(t)=>_.sum(t.store)>0});
            var enemyStructures = creep.room.find(FIND_STRUCTURES,{filter:(s)=>((s.store && s.store[RESOURCE_ENERGY]>0) || s.energy > 0) && s.owner })
            var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
            //Transfer boost materials
            var labs = Hivemind.find({type:'structures',room:creep.room.name,structureType:STRUCTURE_LAB});//,creep.room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LAB});
            //console.log(creep,labs,creep.room.terminal.store["XGH2O"])
            //console.log(creep,containers,_.sum(containers,(c)=>c.store[RESOURCE_ENERGY]));
            if(enemyStructures.length && !creep.room.controller.my)
            {
                var closest = creep.pos.findClosestByRange(enemyStructures);
                if(!closest) closest = enemyStructures[0];
            }
            else if(structures.length && (creep.memory.defaultState =="upgrading" || creep.memory.defaultState =="building"))
            {//console.log(creep,"testb")
                var closest = creep.pos.findClosestByRange(structures);
                if(!closest) closest = structures[0];
            }
            var droppedEnergy = Hivemind.find({type:'resources',room:creep.room.name,resourceType:RESOURCE_ENERGY}); creep.room.find(FIND_DROPPED_RESOURCES,{filter:{resourceType:RESOURCE_ENERGY}});
            //console.log(creep.name,droppedEnergy)
            //Look for links (if upgrader)
            if(labs.length && creep.room.terminal && creep.room.terminal.store["XGH2O"] > 30 && creep.memory.defaultState == "collecting")
            {
                creep.memory.target = creep.room.terminal.id;
            }
            else if(closest && creep.pos.getRangeTo(closest) < 12)
            {
                //console.log(creep,"testa")
                creep.memory.target = closest.id;
            }
            else if(tombstones.length && (creep.memory.defaultState == "collecting" || creep.memory.defaultState == "hauling") && !enemies.length)
            {
                //creep.log(creep,"testc")
                creep.memory.target = tombstones[0].id;
            }
            
            
            //TODO: unowned structures
            //Look for dropped energy
            else if(droppedEnergy.length && ((_.sum(droppedEnergy,'amount') > Math.min(150,creep.carryCapacity) || creep.memory.defaultState =="hauling" || (creep.room.storage && creep.room.storage.store && creep.room.storage.store[RESOURCE_ENERGY] <300) || creep.memory.rebuild == true)))
            {
                //console.log(creep,"testd")
                //Prevent creep from selecting other energy when there is very close
                var closestEnergy = creep.pos.findClosestByRange(droppedEnergy);
                if(closestEnergy && creep.pos.inRangeTo(closestEnergy,20))
                {
                    creep.memory.target = closestEnergy.id;
                }
                else
                {
                    var biggestEnergy = _.sortBy(droppedEnergy,(e)=>e.amount)[droppedEnergy.length-1]
                    creep.memory.target = biggestEnergy.id;
                }
            }
            //Look for containers
            else if(containers.length && _.sum(containers,(c)=>c.store[RESOURCE_ENERGY]) >  Math.min(100,creep.carryCapacity))
            {
                //console.log(creep,"test")
                    var randomContainer = _.sample(containers);
                    var t = Game.getObjectById(creep.memory.target)
                    if(!t||!t.amount || randomContainer.store[RESOURCE_ENERGY]>t.amount)
                    {
                        creep.memory.target = randomContainer.id;
                    }
                }
            else if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY]>0) {
                creep.memory.target = creep.room.storage.id;
            }
            else if(_.filter(creep.body,(bp)=>bp.type == WORK).length)
            {
                creep.memory.state = "building";
            }
            //Go home to pick up energy
            else if(creep.room.name != creep.memory.home)
            {
                //console.log(creep,"poep")
                creep.memory.targetRoom = creep.memory.home;
                creep.memory.state = "traveling";
            }
             else if(Hivemind.pickFarSource(creep.room.name,"hauling"))
            {
                //console.log("test",creep)
                creep.memory.state = "hauling"
            }
            else if(structures.length && !_.filter(Game.creeps,(c)=>c.memory.home == creep.memory.home && creep.memory.defaultState == "filling"))
            {
                var closest = creep.pos.findClosestByRange(structures);
                if(!closest) closest = structures[0];
                creep.memory.target = closest.id;
            }
        }

        //If there is a target, take it
        if(creep.memory.target)
        {
            creep.say("move target")
            var target = Game.getObjectById(creep.memory.target);
            //console.log(creep,target)
            //console.log(creep,console.log(creep.withdraw(target,RESOURCE_ENERGY)))
            if((target instanceof Tombstone || target instanceof StructureStorage) && creep.memory.defaultState == "collecting")
            {
                if(_.sum(target.store) == 0)
                 {
                    creep.memory.collectCountdown = 0;
                 }  
                else if(creep.pos.isNearTo(target))
                {
                    for(r in target.store)
                    {
                        if(creep.withdraw(target,r) != 0)
                        {
                            creep.memory.collectCountdown--;
                        }

                    }
                }
                else
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(target instanceof StructureTerminal )
            {
                //console.log(creep,"terminal")
                if(creep.memory.defaultState == "collecting" && target.store["XGH2O"])
                {
                    //console.log(creep,"withdraw mineral")
                    if(creep.withdraw(target,"XGH2O") == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                
                if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    //console.log(creep,"withdraw energy")
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if(creep.pickup(target) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            else if(creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            else
            {
                creep.memory.collectCountdown--;
            }
            if(!target || target == null) 
            {
                creep.memory.target = false;
            }
            
        }

                //Change state
        if(_.sum(creep.carry) >= minEnergy || _.sum(creep.carry) == creep.carryCapacity)
        {
            //console.log(creep,"dropoff")
            creep.memory.state = "dropOff";
            if(creep.memory.defaultState != "hauling")creep.memory.target = false;
            if(creep.memory.defaultState != "collecting"  ) creep.memory.state = creep.memory.defaultState;
            else creep.memory.state = "hauling"
      }
		
    }
};

module.exports = stateCollecting;