var stateFilling = {

    /** @param {Creep} creep **/
    run: function(creep,hivemind) {
        var links = hivemind.find({type:'farms',room:creep.room.name});
        //console.log(creep,creep.pos,links)
        if(_.sum(creep.carry) === 0)
        {
            if(creep.memory.farmLink)
            {
                var farmLink = Game.getObjectById(creep.memory.farmLink)
                if(!farmLink) creep.memory.farmLink = false;
                if(creep.pos.isNearTo(farmLink))
                {
                    creep.withdraw(farmLink,RESOURCE_ENERGY);
                }
                else
                {
                    creep.moveTo(farmLink);
                }
            }
            else
            {
                links = _.filter(links,(l)=>Game.getObjectById(l) && !_.some(Game.creeps,(c)=>c.id != creep.id && c.memory.defaultState == "filling" && c.memory.farmLink == l))
               //console.log(creep,links)
               if(links.length)
                {
            
                    var target = creep.pos.findClosestByRange(links);
                    if(!target) target = links[0]
                    target = Game.getObjectById(target);
                    
                    creep.memory.farmLink = target.id;
                    if(creep.pos.isNearTo(target))
                    {
                        creep.withdraw(target,RESOURCE_ENERGY);
                    }
                    else
                    {
                        creep.moveTo(target);
                    }
                }
            }
        }
        //Find upgrade container
        else 
        {
                creep.memory.state = "dropOff";
        }
        
    }
        
};

module.exports = stateFilling