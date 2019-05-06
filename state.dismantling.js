var stateDismantling = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var squad = _.filter(Game.creeps,(c)=>(c.memory.defaultState == "tanking" || c.memory.defaultState == "healing"))
        var squadReady = true; //&& squad.length >= 2;
        var targetRoom = "E27N57"
        switch (creep.memory.home){
            case "E23N57":
                targetRoom = "E23N56";
                break;
            case "E27N57":
                targetRoom = "E27N58";
                break;
        }
        if(_.sum(creep.carry) > 0 && creep.room.name == creep.memory.home)
        {
            creep.memory.state = "dropOff";
        }
        else if(_.sum(creep.carry) == creep.carryCapacity)
        {
            creep.memory.targetRoom = creep.memory.home;
            creep.memory.state = "traveling";
        }
        else if(creep.room.name != targetRoom && squadReady)
        {
            creep.memory.state = "traveling";
            creep.memory.targetRoom = targetRoom;
        }
        else if(creep.memory.dismantleTarget)
        {
            var target = Game.getObjectById(creep.memory.dismantleTarget)
            //console.log(target)
            if(!target) creep.memory.dismantleTarget = false
            else
            {
                if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                
            }
        }
        else if (!creep.room.controller.my)
        {
        //1.	if enemy tower in room, attack enemy tower
        var targets = [];//creep.room.find(FIND_HOSTILE_STRUCTURES);
        
        targets = creep.room.find(FIND_STRUCTURES,{filter:(s)=> !s.my && (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL)});
        targets = _.sortBy(targets,'hits');
        //console.log(creep,targets)
        if(targets.length)
        {
            //console.log(targets)
            var target = targets[0];
            creep.memory.dismantleTarget = target.id;
            if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
        }

        else
        {
            var travelTarget = creep.room.controller;
            
            
            if(creep.pos.getRangeTo(travelTarget)>5) creep.travelTo(travelTarget);
        }
        }
    }
};

module.exports = stateDismantling;