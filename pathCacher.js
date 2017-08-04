var pathCacher = {
    

    //Generates paths for the room between key objects
    generatePaths: function(helper)
    {
        if(true)
        {
             helper.pathCache = {}
            var keyStructures = helper.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_CONTROLLER || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_STORAGE))
                        }})
                        
            //var keyObjects = _.union(keyStructures, [Game.flags[helper.sourcePickups[0]],Game.flags[helper.sourcePickups[1]]]);
            
            //console.log(keyObjects)
            for(var o1 in keyObjects)
            {
                for(var o2 in keyObjects)
                {
                    if(keyObjects[o1].id != keyObjects[o2].id)
                    {
                        if(!helper.pathCache[keyObjects[o1].id])
                        {
                            helper.pathCache[keyObjects[o1].id] = {}
                        }
                        helper.pathCache[keyObjects[o1].id][keyObjects[o2].id] = helper.room.findPath(keyObjects[o1].pos,keyObjects[o2].pos)
                    }
                }
            }
        }
    },
    
    moveByPath : function(creep,newPos)
    {
        var paths = Memory.Helper[creep.memory.spawnRoom].pathCache;
        //See if there is a matching path
        
        if(creep.memory.currentPath)
        {
            console.log(creep.name,"Taking step on cached path")
            creep.move(creep.memory.currentPath[creep.memory.stepOnPath].direction);
            creep.memory.stepOnPath++;
            
            if(creep.memory.stepOnPath > creep.memory.currentPath.length)
            {
                creep.memory.currentPath = 0;
            }
            
            RoomVisual.poly(creep.pos,newPos)
            return
        }
        
        for(var o1 in paths)
        {
            for (var o2 in paths)
            {
                //console.log(o1)
                var p = Game.getObjectById(o1).pos;
                if(p.isNearTo(creep.pos.x,creep.pos.y) && Game.getObjectById(o2).pos == newPos)
                {
                    creep.moveTo(p);
                    console.log(creep.name, "moving to start of path")
                }
                else {
                    var path = paths[creep.pos]
                    if(path) { path = paths[creep.pos][newPos]} 
                    
                    if(path)
                    {
                        console.log("Using cached path")
                        creep.memory.currentPath = path;
                        creep.move(creep.memory.currentPath[0].direction);
                        creep.memory.stepOnPath = 1;
                        return
                    }
                }
            }
        }
        
            console.log(creep.name,"No cached path", newPos)
            creep.moveTo(newPos)
        
    }
        
};

module.exports = pathCacher;