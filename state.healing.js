 var stateHealing = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var squad = _.filter(Game.creeps,(c)=>(c.memory.defaultState == "tanking" || c.memory.defaultState == "healing")&& creep.pos.inRangeTo(c,2))
        var squadReady = squad.length >= 5;
        var hurtSquad = _.filter(squad,(c)=>c.hits<c.hitsMax );
        if(creep.room.name != "E23N56" && squadReady)
        {
            creep.memory.state = "traveling";
            creep.memory.targetRoom = "E23N56"
        }
        if(creep.hits < creep.hitsMax)
        {
            creep.heal(creep);
        }
        else if(hurtSquad.length)
        {
            if(creep.heal(hurtSquad[0]) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(hurtSquad[0]);
            }
        }
        else if(creep.memory.tankTarget)
        {
            var target = Game.getObjectById(creep.memory.tankTarget)
            //console.log(target)
            if(!target) creep.memory.tankTarget = false
            else
            {
                if(!creep.pos.inRangeTo(target,25)) {
                        creep.travelTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                
            }
        }
        else
        {
        //1.	if enemy tower in room, attack enemy tower
        var targets = [];//creep.room.find(FIND_HOSTILE_STRUCTURES);
        
        targets = creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:{structureType:STRUCTURE_TOWER}})
        if(targets.length)
        {
            //console.log(targets)
            var target = creep.pos.findClosestByRange(targets);
            if(!target) target = targets[0];
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}, ignoreDestructibleStructures:true});
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

module.exports = stateHealing;