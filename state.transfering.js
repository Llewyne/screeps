var stateTransfering = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var links = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LINK});
      //console.log(creep,links,containers)
        if(_.sum(creep.carry) === 0)
        {
            var target = creep.room.storage

            if(creep.pos.isNearTo(target))
            {
                creep.withdraw(target,RESOURCE_ENERGY);
            }
            else
            {
                creep.moveTo(target);
            }
        }
        //Find upgrade container
        else 
        {
            var links = creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.structureType==STRUCTURE_LINK});
                var target = creep.pos.findClosestByRange(links);
                if(!target)target = links[0]

            if(creep.pos.isNearTo(target))
            {
                creep.transfer(target,RESOURCE_ENERGY);
            }
            else
            {
                creep.moveTo(target);
            }
        }
        
    }
        
};

module.exports = stateTransfering