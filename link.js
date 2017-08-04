var linkSender = {

    /** @param {Creep} creep **/
    run: function(link) {
        var target = Game.getObjectById(creep.memory.target);
        if(target)
        {
            if(creep.reserveController(target) == ERR_NOT_IN_RANGE) {
               creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else
        {
            creep.moveTo(Game.flags["Controller2"], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
	}
};

module.exports = roleClaimer;