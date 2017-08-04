var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if(target)
        {
            if(creep.claimController(target) == ERR_NOT_IN_RANGE) {
               creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if(creep.reserveController(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else
        {
            creep.moveTo(Game.flags["Controller2"], {visualizePathStyle: {stroke: '#ffaa00'}});
            creep.memory.target = '58dbc5088283ff5308a3fdff';
        }
	}
};

module.exports = roleClaimer;