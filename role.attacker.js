var roleAttacker = {
    

    /** @param {Creep} creep **/
    run: function(creep) {
	    
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        
        if(targets.length)
        {
            
            
            var target = creep.pos.findClosestByPath(targets);
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else 
        {
            
        }
        
	}
};

module.exports = roleAttacker;