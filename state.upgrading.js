var stateUpgrading = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
       var labs = creep.room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LAB && s.mineralAmount > 30 && s.mineralType == "XGH2O" && s.energy > 20});
       var fullyBoosted = _.filter(creep.body,(bp)=>bp.type == WORK).length == _.filter(creep.body,(bp)=>bp.boost == "XGH2O").length;
        
        var links = _.map(hivemind.find({type:'upgradeLinks',room:creep.room.name}),(l)=>Game.getObjectById(l));
        var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER && creep.room.controller.pos.getRangeTo(s)<7});
        
        
        //Turn into miner if needed
        var amountMiners = _.filter(Game.creeps,(c)=>c.memory.defaultState == "mining" && c.memory.home == creep.room.name).length;
        if(creep.memory.defaultState == 'upgrading' && creep.room.energyAvailable < 300 && !amountMiners)
        {
            creep.say("changing to miner")
            creep.memory.defaultState = "mining";
            creep.memory.home = creep.room.name;
            creep.memory.state = ""
            
        }
        else if(!creep.room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}}).length)
        {
            creep.memory.defaultState = "building";
            creep.memory.state = ""
        }
        else if(creep.memory.defaultState == 'upgrading' && labs.length && !fullyBoosted && creep.ticksToLive > 1400)
        {
            creep.say("boosting")
            creep.memory.state = 'boosting';
        }
        else 
        {
            //Handle stationary upgraders
            if(false &&links.length && containers.length)
            {
                if(!creep.pos.isEqualTo(containers[0]))
                {
                    creep.travelTo(containers[0]);
                }
                else
                {
                    //Grab energy from container and upgrade controller
                    var amountWork = _.filter(creep.body,(bp)=>bp.type == WORK).length;
                    var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] && s.pos.getRangeTo(creep.room.controller)<7});
                    ///console.log(creep,Game.time,"get from container")
                    var container = creep.pos.findClosestByRange(containers);
                    var link = creep.pos.findClosestByRange(links);
                    
                    console.log(creep,"w link",creep.withdraw(link,RESOURCE_ENERGY));
                    console.log(creep,"w con",creep.withdraw(container,RESOURCE_ENERGY));
                    
                    console.log(creep,"up",creep.upgradeController(creep.room.controller));
                    
                    console.log(creep,"t con",creep.transfer(container));
                }
            }
            
            //Handle regular upgraders
           else
           {
               if(creep.carry[RESOURCE_ENERGY] === 0)
               {
                   
                    containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>((s.structureType == STRUCTURE_CONTAINER  && s.store[RESOURCE_ENERGY]) || (s.structureType == STRUCTURE_LINK && s.energy))&& s.pos.getRangeTo(creep.room.controller)<7});
                    if(containers.length)
                   {
                       if(creep.withdraw(containers[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.travelTo(containers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                   }
                   else
                   {
                    //console.log(creep,Game.time,"collect")
                       creep.memory.target = false;
                       creep.memory.state = "collecting";
                       if(!_.filter(Game.spawns,(s)=>s.room == creep.room).length)
                       {
                           creep.memory.state = "mining";
                       }
                   }
               }
               else
               {
                   var sign = "claimed"
                   if(!creep.room.controller.sign|| creep.room.controller.sign.username != "Llewyne")
                   {
                       if(creep.signController(creep.room.controller,sign) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ffffff'},range:1});
                       }
                    }
                   
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ffffff'},range:3});
                    }
                    
                    //console.log(creep.upgradeController(creep.room.controller))
               }
           }
       
        }
    }
        
};

module.exports = stateUpgrading;