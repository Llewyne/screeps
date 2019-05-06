var stateHauling = {

    /** @param {Creep} creep **/
    run: function(creep,Hivemind) {
        
        var minEnergy = 50*(creep.room.find(FIND_STRUCTURES,{filter:{stuctureType: STRUCTURE_EXTENSION}}).length+1);
        if(creep.memory.defaultState !="collecting") minEnergy =creep.carryCapacity;
        
        //console.log(creep,haulRooms)
        //Carry full
        if(_.sum(creep.carry) >= minEnergy || _.sum(creep.carry) == creep.carryCapacity)
        {
            creep.say("full")
            creep.memory.targetRoom= creep.memory.home;
            creep.memory.miningRoom= false;
            var targets = _.filter(creep.room.find(FIND_STRUCTURES),(target) => target.my && ((target.hits < 999 && target.hits)|| (target.structureType==STRUCTURE_CONTAINER && target.hits < 24000)));
            
            
            if(creep.room.name == creep.memory.targetRoom)
            {
                creep.memory.state = "dropOff";
                creep.memory.targetRoom = false;
            }
            else if(targets.length && _.filter(creep.body,(bp)=>bp.type == WORK).length)
            {
                creep.say("repair")
                creep.memory.state = "repairing"
            }
            else
            {
                creep.memory.state = "traveling";
            }
        }
        else
        {
            if(!creep.memory.miningRoom)
            {
                creep.memory.targetRoom = Hivemind.pickFarSource(creep.memory.home,"hauling");
                creep.memory.miningRoom = creep.memory.targetRoom;
            }
            
            if(creep.room.name == creep.memory.miningRoom)
            {
                creep.say("collect")
                creep.memory.state = "collecting";
            }
            else
            {
                creep.say("travel to collect")
                creep.memory.state = "traveling";
                if(!creep.memory.targetRoom)creep.memory.targetRoom= creep.memory.miningRoom;
            }
        }
    }
        
};

module.exports = stateHauling;