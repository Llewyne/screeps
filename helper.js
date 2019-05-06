var helper = {

    /** Setup **/
    setup: function() {
        if(!Memory.counter) Memory.counter = 0;
    },
    /** Returns the best possible creep to spawn **/
    requireCreep: function(room,hivemind) {
        var cpuLog = false;
        //console.log(room.name,Game.time)
        var rebuildArmy = false;
        //Priority list for creep roles/states
        var priorityList = ['rAttacking','attacking','collecting','filling','transfering','moving','mining','scouting','tanking','healing','dismantling','thieving','raiding','claiming','upgrading','farMining','building','reserving','hauling','roadBuilding','minMining','minCollecting','repairing'];
        //Different list when there are few creeps
        var rc = _.filter(Game.creeps,(c)=>c.room.name == room.name); //Room creeps
        var hc = _.filter(Game.creeps,(c)=>c.memory.home == room.name); 
        if(!this.amountCreeps(rc,'mining') ||(!this.amountCreeps(hc,'collecting') && (!this.amountCreeps(rc,'filling') || !hivemind.find({type:'sourceLinks',room:room.name}).length)) || !this.amountCreeps(hc,'repairing')|| (room.controller.level <4 && !this.amountCreeps(rc,'upgrading')))
        {
            //console.log(room,"using rebuild list")
            priorityList = ['collecting','rAttacking','attacking','thieving','mining','repairing','building','upgrading'];
            rebuildArmy = true;
        }
        //console.log("should spawn",Game.cpu.getUsed())
        for(var s in priorityList){
            s = priorityList[s];
            //See if creep should be spawned at all
            //console.log(room,s,rebuildArmy)
            if(cpuLog)console.log("should spawn",Game.cpu.getUsed())
            if(this.shouldSpawnCreep(hivemind,room,s,rebuildArmy))
            {
                
                var creepBody = this.designCreep(room,s,rebuildArmy);
                //console.log(room,"Trying to spawn " + s + " with body: " + creepBody)
                //console.log(Game.spawns["Spawn1"].spawnCreep(creepBody,s + Memory.counter,{memory: {defaultState:s}}))
                var spawn = _.filter(Game.spawns,(s)=>s.room == room)[0];
                //var dir = [LEFT,RIGHT,BOTTOM,TOP,BOTTOM_LEFT,TOP_LEFT,TOP_RIGHT,BOTTOM_RIGHT];
                
                ///TODO: dynamically choose spawn
                
                var rebuild = rebuildArmy;
                var dirs = [TOP,LEFT,RIGHT,BOTTOM,TOP,BOTTOM_LEFT,TOP_LEFT,TOP_RIGHT,BOTTOM_RIGHT];
                //console.log(room,dir)
                if(this.designCreep(room,s,false) == this.designCreep(room,s,true)) rebuild = false
                //console.log(room,s,creepBody)
                var spawnResult = spawn.spawnCreep(creepBody,s + Memory.counter,{memory: {defaultState:s, home:room.name, rebuild:rebuild}, directions:dirs});
                //console.log(room,spawnResult)
                if(spawnResult === 0)
                {
                    ///TODO: claiming rooms
                    /*
                    if(Memory.queuedCreep[0] == room.name && Memory.queuedCreep[1] == s)
                    {
                        Memory.queuedCreep = [];
                        console.log(room,"Spawned queued creep with state ", s, " and rebuild is ", rebuild)
                        if(s!= "buiding")Game.creeps[s + Memory.counter].memory.state = "traveling";
                        Game.creeps[s + Memory.counter].memory.travelPath = Memory.travelPath;
                        Game.creeps[s + Memory.counter].memory.home = "E24N59"
                    }
                    */
                    if(s == "claiming")
                    {
                        Game.creeps[s + Memory.counter].memory.state = "traveling";
                        Game.creeps[s + Memory.counter].memory.targetRoom = hivemind.roomToClaim(room.name)
                    }
                    
                    
                    console.log(room,"spawning",s, "rebuild", rebuild)
                    Memory.counter++;
                    
                }
                break;
            }
        }
        
       
    },
    
    /** Designs a creep for a certain room with a certain default state**/
    designCreep: function(room,state,rebuildArmy){
        var energyCapacity = room.energyCapacityAvailable;
        //If there are no creeps of that type in the room, make smallest possible
        if(rebuildArmy) energyCapacity = room.energyAvailable;
        //console.log(room,state,energyCapacity)
        //Return values
        var body = [];
        switch(state){
            case 'minMining':
                body = this.designSpecificCreep(energyCapacity,[MOVE,WORK],[WORK],5);
                break;
            case 'mining':
                body = this.designSpecificCreep(energyCapacity,[MOVE,WORK,CARRY],[WORK],4);
                //if(rebuildArmy) body = this.designSpecificCreep(energyCapacity,[MOVE,WORK],[WORK],4);
                break;
            case 'farMining':
                body = this.designSpecificCreep(energyCapacity,[MOVE,WORK,CARRY,MOVE],[WORK,MOVE],4);
                break;
            case 'minCollecting':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,CARRY],2);
                break;
            case 'transfering':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,CARRY],1);
            case 'redistributing':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,CARRY],5);
                break;
            case 'filling':
                body = this.designSpecificCreep(energyCapacity,[MOVE,CARRY,CARRY],[MOVE,CARRY,CARRY],2);
                break;
            case 'thieving':
                body = this.designSpecificCreep(energyCapacity,[MOVE,CARRY],[MOVE,CARRY],6);
                break;
            case 'moving':
            case 'collecting':
                body = this.designSpecificCreep(energyCapacity,[MOVE,CARRY,CARRY],[MOVE,CARRY,CARRY],6);
                break;
            case 'hauling':
                body = this.designSpecificCreep(energyCapacity,[WORK,MOVE,CARRY],[MOVE,CARRY,CARRY,CARRY],8);
                break;
            case 'upgrading':
                if(false && room.controller.level > 4) body = this.designSpecificCreep(energyCapacity,[MOVE,CARRY,WORK],[MOVE,WORK,WORK,WORK,WORK],4);
                else body = this.designSpecificCreep(energyCapacity,[],[MOVE,CARRY,WORK],14);
                break;
            case 'building':
            case 'repairing':
            case 'roadBuiling':
                body = this.designSpecificCreep(energyCapacity,[MOVE,CARRY,WORK],[MOVE,MOVE,CARRY,WORK],11);
                break;
            case 'attacking':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,ATTACK],5);
                break;
            case 'rAttacking':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,MOVE,RANGED_ATTACK],5);
                break;
            case 'raiding':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,MOVE,RANGED_ATTACK],5);
                break;
            case 'dismantling':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,MOVE,WORK,CARRY],5);
                break;
            case 'tanking':
                body = this.designSpecificCreep(energyCapacity,[MOVE,HEAL],[MOVE,TOUGH],10);
                break;
            case 'healing':
                body = this.designSpecificCreep(energyCapacity,[],[MOVE,MOVE,HEAL,HEAL],5);
                break;
            case 'claiming':
                body = [CLAIM,MOVE,MOVE];
                break;
            case 'reserving':
                body = [CLAIM,CLAIM,MOVE];
                break;
            case 'scouting':
                body =[MOVE];
                break;
        }
        
        return body;
    },

    designSpecificCreep : function(energyCapacity,baseBody,restBody,maxRepeat)
    {
        if(!baseBody.length)
        {
            baseBody = restBody;
        }

        //Calculate the cost of the base body
        var costBase = 0;
        for(var bp in baseBody)
        {
            costBase += BODYPART_COST[baseBody[bp]];
        }

        //Calculate the cost of the repeating bodyparts
        var costRest = 0;
        for(var bp in restBody)
        {
            costRest += BODYPART_COST[restBody[bp]];
        }

        var amountRepeat = Math.min(maxRepeat,_.floor((energyCapacity - costBase) / costRest));
        restBody = this.replicate(restBody,amountRepeat);
        return baseBody.concat(restBody);
    },


    
    shouldSpawnCreep : function(hivemind,room,state,rebuildArmy)
    {
        cpuLog = false
        if(Memory.queuedCreep[0] == room.name && Memory.queuedCreep[1] == state)
        {
            return true;
        }
        if(cpuLog)console.log("should spawn befrore creeps",Game.cpu.getUsed())
        var roomCreeps = _.filter(Game.creeps,(c)=>c.memory.home == room.name)
        var creepsInRoom = _.filter(Game.creeps,(c)=>c.room.name == room.name)
        if(cpuLog)console.log("should spawn before sources",Game.cpu.getUsed())
        var adjecentSources= hivemind.amountAdjecentSources(room.name);
        if(cpuLog)console.log("should spawn before sites",Game.cpu.getUsed())
        var amountSites = room.find(FIND_CONSTRUCTION_SITES).length;
        if(cpuLog)console.log("should spawn after sites",Game.cpu.getUsed())
        //console.log(room,creepsInRoom,this.amountCreeps(creepsInRoom,'filling') )
        //console.log("Check if " + state + " should be spawned" )
        //console.log(room,room.controller.level >= 7 && this.amountCreeps(creepsInRoom,'filling') < 1)
        switch(state){
                //A collector should be spawned if there is not enough collector capacity
                case 'filling':
                    var amountFarms = hivemind.find({type:'farms',room:room.name}).length;
                    //console.log(room,amountFarms)
                    if(cpuLog)console.log("should spawn fill",Game.cpu.getUsed())
                    return room.controller.level >= 5 && hivemind.amountCreeps(room.name,'filling') < amountFarms && room.energyCapacityAvailable > 400 && room.storage;
                case 'transfering':
                    return this.amountCreeps(creepsInRoom,'transfering') < 1 && room.storage && room.storage.store[RESOURCE_ENERGY]> 250000;
                case 'thieving':
                    var loot = hivemind.pickRaidRoom(room.name);
                    
                    var amountThieving = hivemind.amountCreeps(room.name,'thieving')
                    return loot && amountThieving < 2;
                case 'collecting':
                    //console.log("should spawn collec start",Game.cpu.getUsed())
                    if(!Object.keys(Game.creeps).length)return false
                    var roomCreeps = _.filter(Game.creeps,(c)=>c.room == room && (rebuildArmy || c.memory.rebuild == false));
                    var totalMiningWork = 0;
                    var totalCollectingCarry = 0;
                    var amountMiners =0;
                    var amountCollectors=0;
                    for(var c in roomCreeps)
                    {
                        c = roomCreeps[c];
                        //console.log(c);
                        if(c.memory.defaultState == "mining") {
                            totalMiningWork += _.filter(c.body,(bp)=>bp.type == WORK).length;
                            amountMiners++;
                        }
                        
                        if(c.memory.defaultState == "collecting") {
                            totalCollectingCarry += _.filter(c.body,(bp)=>bp.type == CARRY).length;
                            amountCollectors++;
                        }
                    }
                    //console.log(room,amountCollectors,amountMiners,rebuildArmy)
                    if(rebuildArmy || room.controller.level >5 ) return amountCollectors < 1;
                    
                    //console.log("should spawn  collect",Game.cpu.getUsed())
                    return (totalCollectingCarry < totalMiningWork*2 || amountCollectors<amountMiners);
                case 'mining':
                    //A miner should be spawned if there are more sources than miners
                    amountMiners = hivemind.amountCreeps(room.name,'mining',100,rebuildArmy)
                    
                    var amountSources = room.find(FIND_SOURCES).length;
                    //console.log(room,amountMiners,amountSources)
                    if(cpuLog)console.log("should spawn mine",Game.cpu.getUsed())
                    return amountMiners < amountSources;
                case 'upgrading':
                    var amountUpgraders = hivemind.amountCreeps(room.name,'upgrading',100)
                    var maxUpgraders = Math.min(4,(8-room.controller.level));
                    
                    if(room.controller.level > 5 || (room.controller.level == 2 && amountSites>5)) maxUpgraders = 1;
                    if(cpuLog)console.log("should spawn upgrade",Game.cpu.getUsed())
                    //console.log(maxUpgraders)
                    return amountUpgraders < maxUpgraders;
                case 'building':
                    var amountBuilders = hivemind.amountCreeps(room.name,'building')
                    var maxBuilders = room.controller.level;
                    if(!_.filter(Game.constructionSites,(site) => site.structureType == STRUCTURE_SPAWN).length) maxBuilders = 2;
                    if(room.controller.level > 4) maxBuilders = 1;
                    if (room.controller.level < 3 && amountSites) maxBuilders = 2;
                    var sites = _.filter(Game.constructionSites,(c)=>room.controller.level > 3 || c.pos.roomName == room.name)
                    
                    return amountBuilders < maxBuilders && Object.keys(Game.constructionSites).length;
                case 'attacking':
                case 'rAttacking':
                    return this.shouldSpawnAttacker(room,state,hivemind,rebuildArmy);
                case 'claiming':
                    var amountClaimers = hivemind.amountCreeps(room.name,'claiming')
                    //console.log(room,amountClaimers,room.energyCapacityAvailable,hivemind.roomToClaim(room.name))
                    return amountClaimers < 1 && hivemind.roomToClaim(room.name) && room.energyCapacityAvailable >= 700;
                    
                case 'minMining':
                    var extractor = room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_EXTRACTOR}});
                    var amountMinMiners = _.filter(Game.creeps,(c)=>c.memory.defaultState == "minMining" && c.memory.home == room.name).length;
                    var mineral = room.find(FIND_MINERALS)[0];
                    return amountMinMiners < 1 && extractor.length && mineral.mineralAmount;
                case 'minCollecting':
                    var extractor = room.find(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_EXTRACTOR}});
                    var mineral = room.find(FIND_MINERALS)[0];
                    var amountMinCollectors = _.filter(Game.creeps,(c)=>c.memory.defaultState == "minCollecting" && c.memory.home == room.name).length;
                    return amountMinCollectors < 1 && extractor.length && mineral.mineralAmount;
                
                case 'hauling':
                    var amountHaulers = hivemind.amountCreeps(room.name,'hauling')
                     var amountFarMiners = hivemind.amountCreeps(room.name,'farMining')
                    return amountHaulers < adjecentSources && amountHaulers < amountFarMiners;
                case 'reserving':
                    var amountReservers = hivemind.amountCreeps(room.name,'reserving')
                    var maxReservers = adjecentSources;
                    return amountReservers < maxReservers && room.energyCapacityAvailable  >=1250;
                    
                case 'farMining':
                    var amountFarMiners = hivemind.amountCreeps(room.name,'farMining',100)
                    //console.log(room,amountFarMiners,adjecentSources)
                    return amountFarMiners < adjecentSources;
                case 'roadBuilding':
                    var amountRoadBuilding = hivemind.amountCreeps(room.name,'roadBuilding')
                    //console.log(room,amountFarMiners)
                    return amountRoadBuilding < adjecentSources;
                case 'repairing':
                    var amountRepairers = _.filter(Game.creeps,(c)=>c.memory.defaultState == "repairing" && c.memory.home == room.name && (rebuildArmy || c.memory.rebuild == false)).length;
                    return amountRepairers < 1&& room.controller.level >1;
                case 'redistributing':
                    var amoundRedistributers = room.storage && _.filter(Game.creeps,(c)=>c.memory.defaultState == "redistributing" && c.room.name == room.name && (rebuildArmy || c.memory.rebuild == false)).length;
                    return room.terminal && amoundRedistributers < 1 && room.energyCapacityAvailable > 400;
                case 'raiding':
                    return false; //(room.name == "E23N57" || room.name == "E25N53") && this.amountCreeps(roomCreeps,'raiding') < 2;
                case 'dismantling':
                    return false;//(room.name == "E27N57") && this.amountCreeps(roomCreeps,'dismantling') < 1;
                case 'tanking':
                    return false && (room.name == "E23N57" || room.name == "E25N53") && this.amountCreeps(roomCreeps,'tanking') < 2;
                case 'healing':
                    return false &&(room.name == "E23N57" || room.name == "E25N53") && this.amountCreeps(roomCreeps,'healing') < 3;
                case 'scouting':
                    var amountScouters = hivemind.amountCreeps(room.name,'scouting')
                    return Object.keys(Memory.Hivemind.roomInfo).length < 200 && this.shouldSpawnScout(hivemind,room.name) && amountScouters <10;
                
                
            }
            return false;
    },
    
    shouldSpawnAttacker: function(room,state,hivemind,rebuild)
    {
        cpuLog = false
        if(cpuLog)console.log("should spawn attaac start",Game.cpu.getUsed())
        if(hivemind.amountCreeps(room.name,state)>=2) return false;
        //There are enemy creeps in the room
        if(cpuLog)console.log("should spawn attaac a amount",Game.cpu.getUsed())
        if(cpuLog)if((room.find(FIND_HOSTILE_CREEPS).length)) return true;
        if(rebuild) return false;
        //console.log("should adj",Game.cpu.getUsed())
        var ars = hivemind.adjecentRooms(room.name)
        //console.log("should adj2",Game.cpu.getUsed())
        for(rm in ars)
        {
            if(Game.rooms[ars[rm]] && Game.rooms[ars[rm]].find(FIND_HOSTILE_CREEPS,{filter:function(c){return c.hits>100}}).length && Game.rooms[ars[rm]].controller) return true;
        }
        //console.log("should spawn attac end",Game.cpu.getUsed())
        //TODO handle far mining 
        return false;
    },
     
    shouldSpawnScout: function(hivemind,room)
    {
        //console.log("test")
        var as = hivemind.adjecentRooms(room)
        for(a in as)
        {
            //console.log(Memory.Hivemind.roomInfo[as[a]].time)
            if(!Memory.Hivemind.roomInfo[as[a]] || !Memory.Hivemind.roomInfo[as[a]].time || Memory.Hivemind.roomInfo[as[a]].time <Game.time)
            {
                return true;
            }
        }
        
        return false;
    },
    
    shouldSpawnSpecificCreep: function(room,state,max)
    {
        var amountState = _.filter(Game.creeps,(c)=>c.room == room && c.memory.defaultState == state).length;
        return amountState < max;
    },
  
    replicate: function(arr, times) {
        for (var parts = []; times > 0; times >>= 1) {
            if (times & 1)
                parts.push(arr);
            arr = arr.concat(arr);
        }
        return Array.prototype.concat.apply([], parts);
    },
    
    amountCreeps: function(creeps,state)
    {
        //console.log(state,_.filter(creeps,(c)=>c.memory.defaultState == state));
        return _.filter(creeps,(c)=>c.memory.defaultState == state).length;
    }

        
};

module.exports = helper;