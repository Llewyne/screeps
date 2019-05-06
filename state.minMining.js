var stateMinMining = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var mineral = creep.room.find(FIND_MINERALS)[0];
        //1. If at mineral => mine it
        if(creep.harvest(mineral) == ERR_NOT_IN_RANGE)
        {
            //2. Else move to mineral
            creep.travelTo(mineral);
        }
        
		
    }
};

module.exports = stateMinMining;