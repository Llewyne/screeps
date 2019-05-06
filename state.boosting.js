var stateBoosting = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var labs = creep.room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LAB && s.mineralAmount > 30 && s.mineralType == "XGH2O" && s.energy > 20});
       var fullyBoosted = _.filter(creep.body,(bp)=>bp.type == WORK).length == _.filter(creep.body,(bp)=>bp.boost == "XGH2O").length;
        
        //console.log(creep,creep.carry["XGH2O"])
        //Check if boosting is possible/needed
        if(!creep.memory.defaultState == 'upgrading' || !labs.length || fullyBoosted || creep.ticksToLive <1400)
        {
            creep.memory.state = creep.memory.defaultstate;
        }
        else if(labs[0].mineralAmount >= 30 && labs[0].energy >= 20)
        {
            if(labs[0].boostCreep(creep) == ERR_NOT_IN_RANGE)
            {
                creep.travelTo(labs[0]);
            }
        }
            
    }
        
};

module.exports = stateBoosting;