var stateMinDropOff = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var mineral = creep.room.find(FIND_MINERALS)[0];
        var labs = creep.room.find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LAB});
       
        var target = creep.room.terminal;
        if(!target || _.sum(target.store) == target.storeCapacity) target = creep.room.storage;
        
        if(labs.length && creep.carry["XGH2O"]) target = labs[0];
        
        if(!target) target = creep.room.storage;
        var containers = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_CONTAINER && _.sum(s.store)<s.storeCapacity});
		if(!target && containers.length) target = containers[0];
		if(!target) 
		{
		    for(r in creep.carry)
		    {
		        creep.drop(r);
		    }
		}
		//2.	if at target => drop off,set state to previous
		
		if(_.sum(creep.carry) >0)
		{
		    if(!creep.pos.isNearTo(target)) {
		    //3.	move to target
                    creep.travelTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else
            {
                if(target.structureType == STRUCTURE_LAB)
                {
                    creep.transfer(target,"XGH2O");
                }
                else
                {
                    for(r in creep.carry)
                    {
                        creep.transfer(target, r)
                    }
                }
            }
		}
        else
        {
            creep.memory.state = creep.memory.defaultState;
        }
		
    } 
};

module.exports = stateMinDropOff;