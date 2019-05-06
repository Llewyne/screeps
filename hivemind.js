
module.exports = {
    setup: function()
    {
        //console.log("Setting up")
        if(!Memory.Hivemind) Memory.Hivemind = {};
        if(!Memory.Hivemind['creeps']) Memory.Hivemind['creeps'] = {};
        if(!Memory.Hivemind['resources']) Memory.Hivemind['resources'] = {};
        if(!Memory.Hivemind['structures']) Memory.Hivemind['structures'] = {};
        if(!Memory.Hivemind['farms']) Memory.Hivemind['farms'] = {};
        if(!Memory.Hivemind['path']) Memory.Hivemind['path'] = {};
        if(!Memory.Hivemind['upgradeLinks']) Memory.Hivemind['upgradeLinks'] = {};
        if(!Memory.Hivemind['sourceLinks']) Memory.Hivemind['sourceLinks'] = {};
        if(!Memory.Hivemind['storageLinks']) Memory.Hivemind['storageLinks'] = {};
        if(!Memory.Hivemind['roomInfo']) Memory.Hivemind['roomInfo'] = {};
        if(!Memory.Hivemind['haulRooms']) Memory.Hivemind['haulRooms'] = {};
        if(!Memory.Hivemind['roads']) Memory.Hivemind['roads'] = {};
    },
    //Finds saved structures, creeps or paths based on the parameters and stores the result
    find: function(options)
    {
        //console.log(JSON.stringify(options))
        if(Memory.Hivemind[options.type][JSON.stringify(options)])
        {
            var t = Memory.Hivemind[options.type][JSON.stringify(options)].time;
            if(Game.time > t)
            {
                //console.log(Game.time,"Hivemind: results too old")
                delete Memory.Hivemind[options.type][JSON.stringify(options)];
            }
            else
            {
                //console.log(Game.time,"Hivemind: reusing find results until",Memory.Hivemind[options.type][JSON.stringify(options)].time)
                return Memory.Hivemind[options.type][JSON.stringify(options)].r;
            }
        }
        //See if there is a cached path that can be used
        else if(options.type == 'path' && Memory.Hivemind[options.type][options.goal])
        {
            var paths = Memory.Hivemind[options.type][options.goal];
            for(o in paths)
            {
                var po = JSON.parse(o);
                if(po.origin.getRangeTo(options.goal)< 3)
                {
                    return paths[o];
                }
            }
        }
        
        var result = {};
        switch(options.type)
        {
            case 'creeps':
                result.r = this.findCreeps(options);
                result.time = Game.time+1;
                break;
            case 'structures':
                result.r = this.findStructures(options);
                result.time = Game.time+20;
                break;
            case 'resources':
                result.r = this.findResources(options);
                result.time = Game.time+3;
                break;
            case 'path':
                result.r = this.findPath(options);
                result.time = Game.time+100;
                Memory.Hivemind[options.type][options.goal][JSON.stringify(options)] = result;
                break;
            case 'farms':
                result.r = this.findFarms(options)
                result.time = Game.time+100;
                break;
            case 'upgradeLinks':
                result.r = this.findUpgradeLink(options);
                result.time = Game.time+100;
                break;
            case 'sourceLinks':
                result.r = this.findSourceLinks(options);
                result.time = Game.time+100;
                break;
            case 'storageLinks':
                result.r = this.findStorageLinks(options);
                result.time = Game.time+100;
                break;
        }
        
        
        Memory.Hivemind[options.type][JSON.stringify(options)] = result;
        //console.log("test1:",Memory.Hivemind[options.type][JSON.stringify(options)])
        //console.log("test:",Memory.Hivemind[options.type])
        return result.r;
    },
    //Find creeps
    findCreeps: function(options)
    {
        var result = [];
        if(options.room)
        {
            result = _.filter(Game.creeps,(c)=>c.room.name == options.room)
        }
        else
        {
            result = Game.creeps;
        }
        
        if(options.defaultState)
        {
            result = _.filter(result,(c)=>c.memory.defaultState == options.defaultState);
        }
        
        if(options.state)
        {
            result = _.filter(result,(c)=>c.memory.state == options.state)
        }
        
        return result;
    },
    //Find structures
    findStructures: function(options)
    {
        var result = [];
        var findType = FIND_STRUCTURES;
        if(options.findType) findType = options.findType;
        if(options.room)
        {
            result = Game.rooms[options.room].find(findType)
        }
        if(options.structureType)
        {
            result = _.filter(result,(s)=>s.structureType == options.structureType)
        }
        return result;
    },
    //Find resources
    findResources: function(options)
    {
        var result = [];
        var resourceType = options.resourceType;
        if(!resourceType) resourceType = RESOURCE_ENERGY;
        if(options.room)
        {
            result = Game.rooms[options.room].find(FIND_DROPPED_RESOURCES);
        }
        if(options.resourceType)
        {
            result = _.filter(result,(r)=>r.resourceType == resourceType)
        }
        //console.log(result)
        return result;
    },
    //Find path
    findPath: function(options)
    {
        if(!options.room) return;
        var path = Game.rooms[options.room].findPath(options.origin,options.goal,{serialize:true})
        return path;
    },
    //Finds extension farms in the room
    //Returns: List of farm links
    findFarms: function(options)
    {
        if(!options.room) return;
        //Find a link next to an extension
        var links = _.map(Game.rooms[options.room].find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_LINK 
            && _.filter(s.room.lookForAtArea(LOOK_STRUCTURES,s.pos.y-2,s.pos.x-2,s.pos.y+2,s.pos.x+2,true),(t)=>t.structure instanceof StructureExtension).length}),
            (l)=>l.id);
        //console.log(links)
        return links;
        
    },
    //Finds links for upgraders to use
    findUpgradeLink: function(options)
    {
        if(!options.room) return;
        //Find a link next to an extension
        var links = _.sortBy(Game.rooms[options.room].find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_LINK && s.pos.getRangeTo(Game.rooms[options.room].controller)<5}),(s)=>s.pos.getRangeTo(Game.rooms[options.room].controller))
        if(links.length) return links[0].id;
        return '';
    },
    //Finds links for miners to use
    findSourceLinks: function(options)
    {
        if(!options.room) return;
        //Find a link next to an extension
        var links = _.map(Game.rooms[options.room].find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_LINK 
            && _.filter(s.room.lookForAtArea(LOOK_SOURCES,s.pos.y-2,s.pos.x-2,s.pos.y+2,s.pos.x+2,true)).length}),
            (l)=>l.id);
        return links;
        
    },
    //Finds links for upgraders to use
    findStorageLinks: function(options)
    {
        if(!options.room || !Game.rooms[options.room].storage) return;
        //Find a link next to an extension
        var links = _.sortBy(Game.rooms[options.room].find(FIND_STRUCTURES,{filter:(s)=>s.structureType == STRUCTURE_LINK}),(s)=>s.pos.getRangeTo(Game.rooms[options.room].storage))
        if(links.length) return links[0].id;
        return '';
    },
    clearMemory: function(type)
    {
        if(!_.isEmpty(Memory.Hivemind[type]) && !_.every(Memory.Hivemind[type],(l)=>l.r == '' || !l.r || (!l.time && !l.length) ))
        {
            if(Memory.Hivemind[type]) Memory.Hivemind[type]= {};
            console.log("Cleared ",type,"memory")
        }
    },
    //Finds possible locations for mining
    haulRooms: function(creep)
    {
        if(Memory.Hivemind.haulRooms[creep.memory.home])
        {
            return Memory.Hivemind.haulRooms[creep.memory.home];
        }
        
        var r = []
        //Find rooms that have energy that are in range
        for(rn in this.adjecentRooms(creep.memory.home))
        {
            if(Memory.Hivemind.roomInfo[this.adjecentRooms[rn]] && Memory.Hivemind.roomInfo[this.adjecentRooms[rn]].hasEnergy)
            {
                r.push(rn);
            }
        }
        
        return r;
    },
    //Scouts a room
    scoutRoom: function(roomName)
    {
        if(Memory.Hivemind.roomInfo[roomName])
        {
            return Memory.Hivemind.roomInfo[roomName];
        }
        else
        {
            return false;
        }
        
    },
    //Returns an array with the adjecent REACHABLE rooms
    adjecentRooms: function(roomName)
    {
        if(!roomName || !Game.rooms[roomName]) return [];
        if(Memory.Hivemind.roomInfo[roomName] && Memory.Hivemind.roomInfo[roomName].adjecentRooms)
        {
            //console.log(roomName,"adjecent rooms frommemory",Memory.Hivemind.roomInfo[roomName].adjecentRooms.length)
            return [...Memory.Hivemind.roomInfo[roomName].adjecentRooms]
        }
        var part1 = roomName[0];
        var part2 = roomName.substring(1,roomName.length).split('N')[0];
        var part3 = 'N'
        if(roomName.substring(1,roomName.length).split('N').length == 1) 
        {
            part2 = roomName.substring(1,roomName.length).split('S')[0];
            part3 = 'S'
        }
        var part4 = roomName.split(part3)[1];
    
        if(Number(part2) <0 || Number(part2)>60 || Number(part4)<0 || Number(part4)>60) return [];
        
        var a = [];
        
        var left = Number(part2)-1;
        
        if(part1 == 'W')
        {
            left = Number(part2)+1;
        }
        
        if(left == -1)
        {
            left = 0;
            if(part1 == 'W')
            {
                part1 = 'E'
            }
            else{ part1 = 'W';}
        }
        
        var right = Number(part2)+1;
        
        if(part1 == 'W')
        {
            right = Number(part2)-1;
        }
        
        if(right == -1)
        {
            right = 0;
            if(part1 == 'W')
            {
                part1 = 'E'
            }
            else{ part1 = 'W';}
        }
        var up = (Number(part4)+1);
        
        if(part3 == 'S')
        {
            up = Number(part4)-1;
        }
        
        if(up == -1)
        {
            up = 0;
            if(part3 == 'S')
            {
                part3 = 'N'
            }
            else{ part3 = 'S';}
        }
         var down = (Number(part4)-1);
        
        if(part3 == 'S')
        {
            down = Number(part4)+1;
        }
        
        if(down == -1)
        {
            down = 0;
            if(part3 == 'S')
            {
                part3 = 'N'
            }
            else{ part3 = 'S';}
        }
        
        a[0] = part1 + left + part3 + part4;
        a[1] = part1 + right + part3 + part4;
        a[2] = part1 + part2 + part3 + up;
        a[3] = part1 + part2 + part3 + down;
        
        //console.log(roomName,JSON.stringify(a))
        var p = new RoomPosition(20,20,roomName);
        //_.map(a,(r)=>console.log(roomName,r,Game.rooms[roomName].findExitTo(r) == p.getDirectionTo(new RoomPosition(20,20,r))))
        a = _.filter(a,(r)=>Game.rooms[roomName].findExitTo(r) == p.getDirectionTo(new RoomPosition(20,20,r)))
        //console.log(roomName,JSON.stringify(a))
        if(!Memory.Hivemind.roomInfo[roomName])
            {Memory.Hivemind.roomInfo[roomName] = {}}
            
        Memory.Hivemind.roomInfo[roomName].adjecentRooms = a;
        return a;
    },
    newScoutTarget: function(currentRoom)
    {
        if(!Memory.Hivemind.roomInfo[currentRoom]) return currentRoom;
        //console.log(JSON.stringify(Memory.Hivemind.roomInfo))
        var rooms = _.shuffle(Object.keys(Memory.Hivemind.roomInfo))
        for(rn in rooms)
        {
            rn = rooms[rn]
            if((!Memory.Hivemind.roomInfo[rn].time ||Game.time > Memory.Hivemind.roomInfo[rn].time) && Game.map.findRoute(currentRoom,rn)!=-2)
            {
                return rn;
            }
            //console.log(rn)
            var rms =this.adjecentRooms(rn)
            rms= _.shuffle(rms)
            for(a in rms)
            {
                var scouters = _.filter(Game.creeps,(c)=>c.memory.defaultState =="scouting" && c.memory.targetRoom==rms[a])
                if(!scouters.length && (!Memory.Hivemind.roomInfo[rms[a]] || !Memory.Hivemind.roomInfo[rms[a]].time ||Game.time > Memory.Hivemind.roomInfo[rms[a]].time)&& Game.map.findRoute(currentRoom,rn)!=-2)
                {
                    return rms[a];
                }
            }
        }
        
        return false;
    },
    amountAdjecentSources: function(room)
    {
        //console.log("countingsources",room,Memory.Hivemind.roomInfo[room])
        if(Memory.Hivemind.roomInfo[room] && Memory.Hivemind.roomInfo[room].adjecentSources && (!Memory.Hivemind.roomInfo[room].time || Memory.Hivemind.roomInfo[room].time > Game.time))
        {
            //console.log("amountadj frommemory")
            //return Memory.Hivemind.roomInfo[room].adjecentSources;
        }
        
        var count= 0;
        var rms =this.adjecentRooms(room)
        for(a in rms)
        {
            if(Game.rooms[rms[a]] && Memory.Hivemind.roomInfo[rms[a]] && !Number.isInteger(Memory.Hivemind.roomInfo[rms[a]].hasEnergy) )
            {
                Memory.Hivemind.roomInfo[rms[a]].hasEnergy = Game.rooms[rms[a]].find(FIND_SOURCES).length;
                //console.log( Game.rooms[rms[a]].find(FIND_SOURCES).length)
            }
            //console.log(room,rms[a],Memory.Hivemind.roomInfo[rms[a]],Number.isInteger(Memory.Hivemind.roomInfo[rms[a]].hasEnergy),(!Game.rooms[rms[a]] || !Game.rooms[rms[a]].controller || !Game.rooms[rms[a]].controller.my ))
            if(Memory.Hivemind.roomInfo[rms[a]] && Number.isInteger(Memory.Hivemind.roomInfo[rms[a]].hasEnergy) && 
            ((!Game.rooms[rms[a]] && !Memory.Hivemind.roomInfo[rms[a]].owner && Memory.Hivemind.roomInfo[rms[a]].sourceKeeper ==0) || 
            (Game.rooms[rms[a]] &&
                (!Game.rooms[rms[a]].controller 
                || !Game.rooms[rms[a]].controller.owner
                || (Game.rooms[rms[a]].controller.my && Game.rooms[room] && Game.rooms[rms[a]].controller.level < Game.rooms[room].controller.level)))))
            {
                //if(!Game.rooms[rms[a]] || !Game.rooms[rms[a]].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}}).length)
                count = count + Memory.Hivemind.roomInfo[rms[a]].hasEnergy;
                //console.log(rms[a],Memory.Hivemind.roomInfo[rms[a]].hasEnergy)
                
            }
        }
        if(Memory.Hivemind.roomInfo[room] )Memory.Hivemind.roomInfo[room].adjecentSources =count;
        return count;
    },
    pickFarSource: function(room,state)
    {
        var rms =this.adjecentRooms(room)
        var result = false;
        var most = 0
        for(a in rms)
        {
            //console.log(rms[a])
            if(Memory.Hivemind.roomInfo[rms[a]] && Memory.Hivemind.roomInfo[rms[a]].hasEnergy && !Memory.Hivemind.roomInfo[rms[a]].sourceKeeper)
            {
                if (!Game.rooms[rms[a]] && !Memory.Hivemind.roomInfo[rms[a]].owner)
                {
                    result = rms[a];
                }
                //if(!Game.rooms[rms[a]].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}}).length)
                
                //{
                var amount = _.filter(Game.creeps,(c)=>c.memory.miningRoom ==rms[a] && (c.memory.defaultState == state || c.memory.state ==state) && c.ticksToLive >100).length;
                if(amount < Memory.Hivemind.roomInfo[rms[a]].hasEnergy && ((Game.rooms[rms[a]] &&Game.rooms[rms[a]].my && Game.rooms[rms[a]].controller.level < Game.rooms[room].controller.level) ||(Game.rooms[rms[a]] && !Game.rooms[rms[a]].owner)))
                {
                   if(state == "hauling")
                    {
                        var energy = _.sum(_.map(Game.rooms[rms[a]].find(FIND_DROPPED_RESOURCES),(r)=>r.amount)) + Game.rooms[rms[a]].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_CONTAINER}}).length
                        //console.log(energy)
                        if(energy>most)
                        {
                            result = rms[a];
                            most = energy;
                        }
                    }
                    else result = rms[a];
                }
                //}
                
            }
        }
        
        return result;
    },
    //Find road
    findRoad: function(startPos,endPos)
    {
        //console.log(startPos.x,startPos.y,endPos.x)
        var road = Memory.Hivemind['roads'][JSON.stringify(startPos) + JSON.stringify(endPos)];
        if(!road || JSON.parse(road).time < Game.time)
        {
            console.log("new road")
            //console.log(startPos,endPos)
            let result = PathFinder.search(
            startPos, endPos,
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,
        
              roomCallback: function(roomName) {
        
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
        
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                  if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                             (struct.structureType !== STRUCTURE_RAMPART ||
                              !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                  }
                });
        
                return costs;
              },
            });
  
            //console.log(result)
            if(!result || !result.path) return false;
            var temp = {}
            temp.road = result;
            temp.time = Game.time + 50;
            temp.start =startPos;
            temp.end = endPos;
            
            Memory.Hivemind['roads'][JSON.stringify(startPos) + JSON.stringify(endPos)] =JSON.stringify(temp);
            
        }
        if(Memory.Hivemind['roads'][JSON.stringify(startPos) + JSON.stringify(endPos)]) return JSON.parse(Memory.Hivemind['roads'][JSON.stringify(startPos) + JSON.stringify(endPos)]);
        
    },
    pickRoadBuild: function(room)
    {
        //console.log("pick road")
        //Energy roads
        //console.log(room)
        var aRooms = this.adjecentRooms(room);
        aRooms.push(room);
        for(ar in aRooms)
        {
            ar = aRooms[ar];
            if(Game.rooms[ar])
            {
                ///TODO: Takeinto account room 
                var sources = Game.rooms[ar].find(FIND_SOURCES, {filter:function(s){return !_.some(Game.creeps,(c)=>c.memory.roadTarget && s.pos.isEqualTo(c.memory.roadTarget.x,c.memory.roadTarget.y))}});
                //console.log(ar,sources)
                for(s in sources)
                {
                    s = sources[s];
                    var spawns = Game.rooms[room].find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})
                    
                    if(spawns.length)
                    {
                    var r = this.findRoad(spawns[0].pos,s.pos)
                    //console.log(r)
                    if(r)
                    {
                        for(p in r.road.path)
                        {
                            if(r.road.path[p].roomName == ar)
                            {
                                var steps = _.filter(Game.rooms[ar].lookForAt(LOOK_STRUCTURES,r.road.path[p].x,r.road.path[p].y),(s)=>s.structureType ==STRUCTURE_ROAD).length;
                                if(steps == 0) return r;
                            }
                        }
                    }
                    }
                    if(Game.rooms[room].controller)
                    
                    {r = this.findRoad(Game.rooms[room].controller.pos,s.pos)
                    //console.log("controller road",r)
                    if(r)
                    {
                        for(p in r.road.path)
                        {
                            if(r.road.path[p].roomName == ar)
                            {
                                var steps = _.filter(Game.rooms[ar].lookForAt(LOOK_STRUCTURES,r.road.path[p].x,r.road.path[p].y),(s)=>s.structureType ==STRUCTURE_ROAD).length;
                                if(steps == 0) return r;
                            }
                        }
                    }
                    }
                }
            }
            else if(Memory.Hivemind.roomInfo[r] && Memory.Hivemind.roomInfo[r].hasEnergy)
            {
                return r;
            }
        }
        
        return false;
    },
    roomToClaim :function(room)
    {
        //console.log("claiming?",room)
        var ownedRooms = _.filter(Game.rooms,(r)=>r.controller && r.controller.my).length;
        if(ownedRooms >= Game.gcl) return false;
        
        var farmFlags = _.filter(Game.flags,(f)=>f.name.includes("farm") && Game.map.getRoomLinearDistance(room,f.pos.roomName) <3 && (!f.room || (f.room.controller && !f.room.controller.owner) ));
        //console.log(farmFlags)
        if(farmFlags.length)
        {
            return farmFlags[0].pos.roomName;
        }
        
        
        var aRooms = this.adjecentRooms(room);
        //console.log("claim",aRooms)
        for(r in aRooms)
        {
            r = aRooms[r];
            //console.log(Memory.Hivemind.roomInfo[r].hasEnergy,Memory.Hivemind.roomInfo[r].time)
            if(Memory.Hivemind.roomInfo[r] && Memory.Hivemind.roomInfo[r].time> Game.time)
            {
                //console.log(r,Memory.Hivemind.roomInfo[r].hasEnergy,Memory.Hivemind.roomInfo[r].owner)
                if (Memory.Hivemind.roomInfo[r].hasEnergy && !Memory.Hivemind.roomInfo[r].owner && !Memory.Hivemind.roomInfo[r].sourceKeeper )
                {
                    return r;
                }
                
            }
            
        }
        
        return false;
    },
    pickRaidRoom: function(room)
    {
        var rms =this.adjecentRooms(room)
        for(a in rms)
        {
            //console.log(rms[a])
            if(Memory.Hivemind.roomInfo[rms[a]] && Memory.Hivemind.roomInfo[rms[a]].hasLoot)
            {
                if (!Game.rooms[rms[a]] || !Game.rooms[rms[a]].controller.owner)
                {
                    return rms[a];
                }
                
            }
        }
        return false;
    },
    amountCreeps: function(room,state,minTicks = 0,rebuild = 'default')
    {
        if(!Memory.Hivemind.amountCreeps)Memory.Hivemind.amountCreeps ={};
        
        if(state== '')state ='all'
        
        if(room!='')
        {
            if(!Memory.Hivemind.amountCreeps[room])
            {
                Memory.Hivemind.amountCreeps[room] = {}
            }
            if(Memory.Hivemind.amountCreeps[room][state] && Memory.Hivemind.amountCreeps[room][state].time && Memory.Hivemind.amountCreeps[room][state].time < Game.time)
            {
                if(rebuild == true && rebuild !='default') return Memory.Hivemind.amountCreeps[room][state].amount;
                if(rebuild == false)
                {
                    //console.log("test")
                    if(minTicks + Memory.Hivemind.amountCreeps[room][state].time >Game.time)return (Memory.Hivemind.amountCreeps[room][state].amount-Memory.Hivemind.amountCreeps[room][state].amountRebuild)-1;
                    return Memory.Hivemind.amountCreeps[room][state].amount-Memory.Hivemind.amountCreeps[room][state].amountRebuild;
                }
                if(minTicks + Memory.Hivemind.amountCreeps[room][state].time >Game.time)return Memory.Hivemind.amountCreeps[room][state].amount-1;
                
                return Memory.Hivemind.amountCreeps[room][state].amount;
            }
            else if (state == 'all')
            {
                Memory.Hivemind.amountCreeps[room][state] = {}
                var creeps = _.filter(Game.creeps,(c)=>c.memory.home== room)
                if(!creeps.length) return 0;
                var rebuildCreeps = _.filter(creeps,(c)=>c.memory.rebuild).length;
                var time = _.sortBy(creeps,'ticksToLive')[0].ticksToLive;
                Memory.Hivemind.amountCreeps[room][state].amount = creeps.length;
                Memory.Hivemind.amountCreeps[room][state].amountRebuild = rebuildCreeps;
                Memory.Hivemind.amountCreeps[room][state].time = Game.time + time;
                if(rebuild =='default')return creeps.length
                if(rebuild) return rebuildCreeps;
                else return creeps.length-rebuildCreeps;
                
            }
            else if(state!='' && Game.rooms[room])
            {
                //console.log("test",rebuild)
                Memory.Hivemind.amountCreeps[room][state] = {}
                var creeps = _.filter(Game.creeps,(c)=>c.memory.home== room&&c.memory.defaultState==state)
                if(!creeps.length) return 0;
                var rebuildCreeps = _.filter(creeps,(c)=>c.memory.rebuild).length;
                var time = _.sortBy(creeps,'ticksToLive')[0].ticksToLive;
                Memory.Hivemind.amountCreeps[room][state].amount = creeps.length;
                Memory.Hivemind.amountCreeps[room][state].amountRebuild = rebuildCreeps;
                Memory.Hivemind.amountCreeps[room][state].time = Game.time+time;
                //console.log("amountcreeps: counted " + creeps.length + " creeps with state " + state + " from " +room)
                //console.log(creeps.length-rebuildCreeps);
                if(rebuild =='default')return creeps.length
                if(rebuild==true) return rebuildCreeps;
                else return creeps.length-rebuildCreeps;
            }
            else
            {
                return 0;
            }
        }
        else 
        {
            console.log("amountCreeps: empty room")
            return 0;
        }
        
    },
    clearAmountCreeps:function(room,state)
    {
        if(room!='' &&Memory.Hivemind.amountCreeps[room])
        {
            if(state != '' && Memory.Hivemind.amountCreeps[room][state])
            {
                Memory.Hivemind.amountCreeps[room][state] = {};
            }
            else if(Memory.Hivemind.amountCreeps[room]['all'])
            {
                Memory.Hivemind.amountCreeps[room]['all'] ={}
            }
        }
    }
    
};