var stateRaiding = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var friendly = Memory.friendList;
        creep.memory.targetRoom = "E23N56";
        //console.log(creep,creep.room.name,creep.memory.targetRoom)
        if(creep.room.name != creep.memory.targetRoom)
        {
            //console.log("test")
            creep.memory.state = "traveling"
            
        }
        else
        {
            var targets = [];
            //See if there are hostile creeps
            targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (c)=> !_.filter(friendly,(u)=>u==c.owner.username).length});
            if(!targets.length)
            {
                targets =creep.room.find(FIND_STRUCTURES,{filter:(s)=>s.energy || (s.store && _.sum(s.store))});;
            }
            if(targets.length)
            {
                //console.log(creep,targets)
                //See if creep is reachable
                var closest = creep.pos.findClosestByPath(targets,{maxRooms:1});
                //console.log(closest)
                if(closest && closest instanceof Creep)
                {
                    creep.memory.attackTarget = closest.id;
                    creep.memory.state = "attacking"
                }
                else if(closest && closest instanceof Structure)
                {
                    creep.memory.target = closest.id;
                    creep.memory.state = "thieving";
                }
                
                //There are targets but they are not reachable
                closest = creep.pos.findClosestByPath(targets,{maxRooms:1,ignoreDestructibleStructures:true});
                //console.log(closest)
                if(closest)
                {
                    var path = creep.pos.findPathTo(closest,{maxRooms:1,ignoreDestructibleStructures:true});
                    //console.log(JSON.stringify(path))
                    //Destroy objects on path
                    for(step in path)
                    {
                        //console.log(step,JSON.stringify(creep.room.lookAt(path[step].x,path[step].y)))
                        var structures = _.filter(creep.room.lookAt(path[step].x,path[step].y),(o)=>o.type == 'structure' && o.structure.hits);
                        //console.log(JSON.stringify(structures));
                        if(structures.length)
                        {
                            //console.log("blbla")
                            creep.memory.attackTarget = structures[0].structure.id;
                            //creep.memory.attackTarget = '5b3d053b9d1c483f11374a3d';
                            creep.memory.state = "attacking";
                            break;
                        }
                        
                    }
                }
            }
            
        }
    }
        
};

module.exports = stateRaiding;