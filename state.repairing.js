var stateRepairing = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.carry[RESOURCE_ENERGY]!= 0)
        {
            var hitLevel = creep.room.controller.level*25000;
            if(creep.room.controller.level <3) hitLevel = 5000
            var targets = _.filter(creep.room.find(FIND_STRUCTURES),(t)=>t.structureType == STRUCTURE_SPAWN && t.hits <t.hitsMax)
            if(!targets.length) targets = _.filter(creep.room.find(FIND_STRUCTURES),(target) => (target.hits < 1999 && target.hits && target.hits < target.hitsMax) 
            || (target.structureType == STRUCTURE_RAMPART || target.structureType == STRUCTURE_WALL) && target.hits < hitLevel
            || (target.structureType == STRUCTURE_CONTAINER && target.hits < 25000));
            //console.log(creep,targets)
            var target = 0;
            if(creep.memory.target)
            {
                target = Game.getObjectById(creep.memory.target)
                if(!target || !_.find(targets,(t)=>t.id == target.id)) //Dit kan efficienter
                {
                    target = 0;
                }
            }
            
            if(!target)
            {
                target = _.sample(targets);
            }
            
            //console.log(creep,targets)
            if(targets.length) {
                //console.log(JSON.stringify(targets))
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.target = target.id;
                }
            }
            else if(creep.memory.defaultState == 'repairing') creep.memory.state = 'building'
            else{
                creep.memory.state = creep.memory.defaultState;
            }
        }
        else
        {
            creep.memory.state = "collecting";
            creep.memory.target = false;
        }
    }
        
};

module.exports = stateRepairing;