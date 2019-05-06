var stateAttacking = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        var friendly = Memory.friendList;
        
        if(creep.memory.attackTarget)
        {
            //console.log(creep,creep.memory.attackTarget)
            var target = Game.getObjectById(creep.memory.attackTarget)
            //console.log(target)
            if(!target) creep.memory.attackTarget = false
            else
            {
                if(_.filter(creep.body,(bp)=>bp.type == ATTACK).length)
                {
                    if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                }
                if(_.filter(creep.body,(bp)=>bp.type == RANGED_ATTACK).length)
                {
                    if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                }
            }
        }
        else
        {
        //1.	if enemy tower in room, attack enemy tower
        var targets = [];//creep.room.find(FIND_HOSTILE_STRUCTURES);
        if(!targets.length)
        {
            //2.    else if enemy creep in room, attack enemy creep
                //targets = creep.room.find(FIND_HOSTILE_CREEPS)
	        targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (c)=> c.pos.x > 0 && c.pos.y >0 && c.pos.x < 49 && c.pos.y < 49 && !_.filter(friendly,(u)=>u==c.owner.username).length});
	        //console.log(creep,targets)
        }
        if(!targets.length && !creep.memory.rebuild)
        {
            var ars = hivemind.adjecentRooms(creep.memory.home)
            for(rm in ars)
            {
                if(Game.rooms[ars[rm]] && Game.rooms[ars[rm]].controller)
                {
                    var targetsInRoom = Game.rooms[ars[rm]].find(FIND_HOSTILE_CREEPS, {filter: (c)=> !_.filter(friendly,(u)=>u==c.owner.username).length});
                    if(targetsInRoom.length) targets =targetsInRoom;
                    
                }
                
            }
        }
        if(targets.length)
        {
            //console.log(creep,targets)
            var target = creep.pos.findClosestByPath(targets);
            if(!target) target = targets[0];
            //console.log(creep,"2",target)
            if(_.filter(creep.body,(bp)=>bp.type == ATTACK).length)
            {
                //console.log(creep)
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
            if(_.filter(creep.body,(bp)=>bp.type == RANGED_ATTACK).length)
            {
                if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
        }

        else
        {
            var travelTarget;
            switch(creep.memory.home)
            {
                case 'E29N57':
                    
                    if(Game.rooms['E29N58']) 
                    {
                        travelTarget = Game.flags["DropPoint"]
                    }
                    break;
                case 'E28N57':
                    if(Game.rooms['E28N58'])
                    {
                        travelTarget = Game.rooms['E28N58'].controller
                    }
                    break;
                case 'E28N55':
                    if(Game.rooms['E27N55'])
                    {
                        travelTarget = Game.rooms['E27N55'].controller
                    }
                    break;
                case 'E29N54':
                    travelTarget = Game.flags['ControllerE29N55'];
                    break;
                default:
                    travelTarget = creep.room.controller;
                    
            }
            
            if(creep.pos.getRangeTo(travelTarget)>5) creep.travelTo(travelTarget);
        }
        }
    }
};

module.exports = stateAttacking;