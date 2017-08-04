var roleRaider = {
    

    /** @param {Creep} creep **/
    run: function(creep) {
	    
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        var enemyTower = 0; Game.getObjectById('59589f7898a9a5032475d923')
        
        var towerTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER);
                    }
            });
            
       var spawnTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN);
                    }
                });
        
        if(targets.length)
        {
            
            if(enemyTower)
            {
                for(t in targets) {
                    {
                        if(!targets[t].pos.inRangeTo(enemyTower.pos,15))
                        {
                            if(creep.attack(targets[t]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targets[t], {visualizePathStyle: {stroke: '#ff0000'}});
                            }
                            break;
                        }
                    }
                }
            }
            else
            {
                var target = creep.pos.findClosestByPath(targets);
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
        }
        else if(!creep.room.my && (towerTargets.length || spawnTargets.length))
        {
            var targets = towerTargets
            if(!targets.length)
            {
                
                targets = spawnTargets;
            }
            var target = creep.pos.findClosestByPath(targets);
                    if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
        }
        else 
        {
            if(!creep.memory.attackTargets || !creep.memory.attackTargetsFlags)
            {
                creep.memory.attackTargets = ['59637ee0700dc7558db8a4cf'];
                creep.memory.attackTargetsFlags = ["StrolledWheat"];
            }
            
            var attackObject = Game.getObjectById(creep.memory.attackTargets[0]);
            if(!attackObject)
            {
                creep.moveTo(Game.flags[creep.memory.attackTargetsFlags[0]], {visualizePathStyle: {stroke: '#ff0000'}});
            }
            else
            {
                if(creep.attack(attackObject) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(attackObject, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
        }
        
	}
};

module.exports = roleRaider;