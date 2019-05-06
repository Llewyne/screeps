var stateMoving = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var start = creep.room.storage.id;
        var end = creep.room.terminal.id;
      //console.log(creep,links,containers)
        if(_.sum(creep.carry) === 0)
        {
            var target = Game.getObjectById(start);

            if(creep.pos.isNearTo(target))
            {
                for(r in target.store)
                    {
                        if(r == RESOURCE_ENERGY) continue;
                        creep.withdraw(target,r)

                    }
            }
            else
            {
                creep.moveTo(target);
            }
        }
        //Find upgrade container
        else 
        {
            var target = Game.getObjectById(end);

            if(creep.pos.isNearTo(target))
            {
                for(r in creep.carry)
                    {
                        if(r == RESOURCE_ENERGY) continue;
                        creep.transfer(target,r)

                    }
            }
            else
            {
                creep.moveTo(target);
            }
        }
        
    }
        
};

module.exports = stateMoving