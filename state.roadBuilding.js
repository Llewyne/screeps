var stateRoadBuilding = {

    /** @param {Creep} creep **/
    run: function(creep,Hivemind) {
        //console.log(creep)
        var origin = creep.memory.roadOrigin
        var amountSites = Object.keys(Game.constructionSites).length;
        //console.log(creep,amountSites)
        if(creep.carry[RESOURCE_ENERGY] === 0 || amountSites >90)
        {
            
            creep.memory.state = creep.memory.defaultState;
            if(creep.memory.defaultState == "roadBuilding")creep.memory.state = "collecting";
        }
        else{
                
            if(!creep.memory.roadOrigin || !creep.memory.roadOrigin.roomName) creep.memory.roadOrigin = Game.spawns["Spawn1"].pos
            if(creep.memory.buildTarget)
            {
                if(creep.build(Game.getObjectById(creep.memory.buildTarget))== ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(Game.getObjectById(creep.memory.buildTarget));
                }
                else 
                {
                    creep.memory.buildTarget =false;
                    creep.memory.state =creep.memory.defaultState;
                }
            }
            else if(!creep.memory.roadTarget)
           {
               //creep.say("poop")
               var r = Hivemind.pickRoadBuild(creep.memory.home)
               if(r.start)
               {
                   creep.memory.roadOrigin = r.start;
                   creep.memory.roadTarget = r.end;
               }
               else if(r)//Can't pick a road since none of the adjecent rooms have visibility
               {
                   creep.moveTo(new RoomPosition(20,20,r))
               }
                   
           }
           else
           {
               //creep.say("peep")
               var target = creep.memory.roadTarget;
               var path = Hivemind.findRoad(origin,target);
               
               //if(creep.pos.getRangeTo(new RoomPosition(target.x,target.y,target.roomName)) < 10)
               //{
                   path = Hivemind.findRoad(target,origin);
               //}
                path = _.map(path.road.path,(p)=> new RoomPosition(p.x,p.y,p.roomName));
               var closest = _.sortBy(path,(p)=>p.getRangeTo(creep))
               closest = _.filter(closest,(c)=>Game.rooms[c.roomName]&&!_.filter(c.lookFor(LOOK_STRUCTURES),(s)=>s.structureType==STRUCTURE_ROAD || s.structureType == STRUCTURE_WALL).length && !_.filter(c.lookFor(LOOK_CONSTRUCTION_SITES)).length && c.x>0 && c.y>0 && c.x<49&&c.y<49);
               //console.log(creep,closest)
               if(closest.length)
               {
                   //creep.say("paap")
                   closest = closest[0];
                    //console.log(creep,closest)
                    var sites = creep.room.lookForAtArea(LOOK_CONSTRUCTION_SITES,creep.pos.y-3,creep.pos.x-3,creep.pos.y+3,creep.pos.x+3,true);
                    //console.log(creep,JSON.stringify(sites))
                    sites =_.filter(sites,(s)=>s.constructionSite.structureType == STRUCTURE_ROAD);
                    //console.log(creep,sites)
                    if(sites.length)
                    {
                        creep.build(sites[0].constructionSite)
                    }
                   else if(creep.pos.getRangeTo(closest) <= 3)
                   {
                       creep.memory.prevRange = false;
                       creep.say("create site")
                       //console.log(creep,closest)
                       creep.room.createConstructionSite(closest,STRUCTURE_ROAD)
                       var site = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0]
                       if(site)
                        {
                            creep.build(site)
                            creep.memory.buildTarget = site.id;
                        }
                       
                   }
                   else
                   {
                       creep.say("bye")
                       var range = creep.pos.getRangeTo(closest);
                       //console.log(creep,closest,range,creep.memory.prevRange)
                       //if(!creep.memory.prevRange || range <creep.memory.prevRange) 
                       {
                            creep.moveTo(closest)
                            if(!creep.fatique)creep.memory.prevRange = range;
                       }
                       /*else
                       {
                           //console.log(creep)
                           creep.memory.prevRange= false;
                           creep.memory.state = creep.memory.defaultState;
                           creep.memory.roadOrigin=false;
                           creep.memory.roadTarget = false;
                       }*/
                   }
               }
               else
               {
                   creep.memory.state = creep.memory.defaultState;
               }
           
           }
	        
       }
    }
};

module.exports = stateRoadBuilding;